<template>
<div class="layout">
  <div v-if="isReadMode" class="layout-read-mode animated zoomInUp">
    <Spin v-if="loadingContent"></Spin>
    <piece-view v-else class="animated fadeInLeft" :id="readBookId == ''?viewPieceId:readBookId" :isBook="readBookId != ''" :readMode="true"></piece-view>
  </div>
  <Layout v-else class="layout-main-mode animated fadeInLeft">
    <Sider class="sider" width="240">
      <div class="sider-title"><span>{{ $util.getTimeStr() }}</span></div>
      <Tabs class="sider-tabs" >
        <TabPane :label="$str.menu" name="menu">
          <Menu width="auto" active-name="recent_read" :open-names="['recent']" accordion class="menu" @on-select="action">
            <Submenu name="recent">
                <template slot="title">{{ $str.recent }}</template>
                <MenuItem name="recent_read"><span>{{ $str.read }}</span></MenuItem>
                <MenuItem name="recent_collect"><span>{{ $str.collect }}</span></MenuItem>
            </Submenu>
            <Submenu name="new">
                <template slot="title">{{ $str.new }}</template>
                <MenuItem name="add_author_drawer"><span>{{ $str.add_author }}</span></MenuItem>
                <MenuItem name="add_piece_drawer"><span>{{ $str.add_piece }}</span></MenuItem>
                <MenuItem name="add_book_drawer"><span>{{ $str.add_book }}</span></MenuItem>
                <MenuItem name="collect_book_drawer"><span>{{ $str.collect_book }}</span></MenuItem>
            </Submenu>
            <MenuItem name="search"><span>{{ $str.search }}</span></MenuItem>
          </Menu>
          <dash-board class="dashboard"></dash-board>
        </TabPane>
        <TabPane :label="$str.index" name="index">
          <index-category @selectCategory="showCategoryItems" @selectAuthor="showAuthorItems"></index-category>
        </TabPane>
        <TabPane class="tab-pane" :label="$str.favorite" name="favorite">
        </TabPane>
      </Tabs>
    </Sider>
    <Content class="content">
      <div class="content-left">
        <list-view class="animated slideInLeft" v-if="listData != null" :data="listData"></list-view>
      </div>
      <div class="content-right">
        <Spin v-if="loadingContent"></Spin>
        <piece-view v-else :id="readBookId == ''?viewPieceId:readBookId" :isBook="readBookId != ''" class="content-piece animated slideInRight"></piece-view>
      </div>
    </Content>
    <Drawer ref="drawer" placement="left" :closable="false" :maskClosable="false" v-model="drawerShow" :width="drawerWidth" @on-close="back" class="drawer" :styles="drawerStyles">
      <div class="drawer-header">
        <div class="drawer-back" type="primary" @click="back"><Icon type="md-close" size="24" /></div>
        <span class="drawer-title">{{ drawerTitle }}</span>
        <div class="drawer-submit" type="primary" @click="submit"><Icon type="md-checkmark" size="24" /></div>
      </div>
      <Spin v-if="loadDrawer" fix/>
      <div v-else class="drawer-content">
        <author-add v-if="actionName === 'add_author_drawer'" :ref="actionName"></author-add>
        <book-add v-else-if="['add_book_drawer', 'modify_book_drawer'].indexOf(actionName) != -1" :ref="actionName" :id="actionName === 'modify_book_drawer' ? bookToDo : ''"></book-add>
        <book-collect v-else-if="actionName === 'collect_book_drawer'" :ref="actionName"></book-collect>
        <piece-add v-else-if="['add_piece_drawer', 'modify_piece_drawer'].indexOf(actionName) != -1" :ref="actionName" :id="actionName === 'modify_piece_drawer' ? pieceToDo : ''"></piece-add>
        <piece-edit v-else-if="actionName === 'edit_piece_drawer'" :ref="actionName" :id="pieceToDo"></piece-edit>
        <piece-relate v-else-if="actionName === 'relate_piece_drawer'" :ref="actionName" :id="pieceToDo" :type="relateType"></piece-relate>
        <piece-record v-else-if="actionName === 'record_piece_drawer'" :ref="actionName" :id="pieceToDo"></piece-record>
      </div>
    </Drawer>
  </Layout>
</div>
</template>
<script>
// 相关组件
import AuthorAdd from '@/components/pages/author/add'
import BookAdd from '@/components/pages/book/add'
import BookCollect from '@/components/pages/book/collect'
import PieceAdd from '@/components/pages/piece/add'
import PieceEdit from '@/components/pages/piece/edit'
import PieceRelate from '@/components/pages/piece/relate'
import PieceRecord from '@/components/pages/piece/record'
import PieceView from '@/components/pages/piece/view'
import IndexCategory from '@/components/pages/category'
import ListView from '@/components/widgets/listview'
import DashBoard from '@/components/widgets/dashboard'
// api方法
import { getPiece, getPieceRecent, getPieceRandom, savePieceHistory, updatePieceNumber } from '@/api/piece'
import { getBook, getCategoryBooks, getAuthorBooks, saveBookHistory, updateBookNumber } from '@/api/book'
export default {
  components: {
    BookAdd,                // 添加书籍
    BookCollect,            // 编撰书籍
    AuthorAdd,              // 添加作者
    IndexCategory,          // 目录索引
    PieceAdd,               // 添加篇章
    PieceEdit,              // 编辑篇章
    PieceRelate,            // 篇章相关
    PieceRecord,            // 篇章朗读
    PieceView,              // 查看篇章
    ListView,               // 项目列表
    DashBoard               // 面板数据
  },
  inject: ['reload'],
  props: {
    randomId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      title: '吉光片羽',     // 主标题
      subtitle: '国学笔记',  // 副标题
      actionName: 'index',  // 触发drawer操作名称
      listData: null,       // item列表
      drawerShow: false,    // 是否显示drawer
      showMenu: true,       // 是否显示菜单栏
      showIndex: true,      // 是否显示分类索引
      showCategory: false,  // 是否显示右侧目录索引
      showBooks: false,     // 是否现在右侧书籍列表
      loadingContent: true, // 是否正在加载内容
      bookList: [],         // 当前展示的书籍列表
      selectedBook: null,   // 当前选中的书籍
      selectedCategory: '', // 当前选中的索引目录
      viewPieceId: '',      // 当前观看的篇章
      readBookId: '',       // 当前阅读的书籍id
      drawerTitle: '',      // drawer标题
      bookSeries: [],       // 书籍卷册
      pieceToDo: '',        // 待操作的篇章
      relateType: 0,        // 相关内容类型
      isReadMode: true,     // 阅读模式
      drawerStyles: {
        padding: '0px',
        background: 'url(static/images/drawer_bg.jpg)',
        backgroundPosition: '50%',
        backgroundSize: 'cover',
        animation: 'bgFloatH 60s ease-in-out infinite'
      },
      loadDrawer: true
    }
  },
  mounted () {
    this.init()
  },
  watch: {
  },
  computed: {
    drawerWidth: function() {
      if (['add_piece_drawer', 'edit_piece_drawer', 'relate_piece_drawer', 'collect_book_drawer', 'record_piece_drawer'].indexOf(this.actionName) > -1) {
        return 600
      }
      return 400
    }
  },
  methods: {
    init () {
      this.$bus.on('back', this.back)
      this.$bus.on('reload', this.reload)
      this.$bus.on('refresh', this.refresh)
      this.$bus.on('showList', this.showList)
      this.$bus.on('changeMode', this.changeMode)
      this.$bus.on('actionBook', this.actionBook)
      this.$bus.on('randomPiece', this.randomPiece)
      this.$bus.on('actionPiece', this.actionPiece)
      this.$bus.on('addPieceRelate', this.addPieceRelate)
      this.showPiece(this.randomId)
      this.loadPieceRecent('view')
      this.initCategory()
      document.onkeyup = (event) => {
        let e = event || window.event || arguments.callee.caller.arguments[0]
        if (e && e.keyCode == 32 && event.target.tagName == 'BODY' && !this.drawerShow) {
          this.changeMode()
        }
      }
    },
    loadPieceRecent (val) {
      const title = this.$str.recent + (val == 'view' ? this.$str.read : this.$str.collect)
      const params = {
        orderBy: val
      }
      this.showList(title, 'recent-items', params)
    },
    initCategory () {
      this.bookSeries = [
        {
          id: 0,
          title: '卷册篇章',
          last_level: 0,
          loading: false,
          children: []
        }
      ]
    },
    action (name) {
      let dic = {
        'add': this.$str.add,
        'edit': this.$str.edit,
        'modify': this.$str.modify,
        'content': this.$str.content,
        'author': this.$str.author,
        'book': this.$str.book,
        'collect': this.$str.collect,
        'piece': this.$str.piece,
        'relate': this.$str.relate,
        'record': this.$str.record
      }
      if (name.indexOf('drawer') > -1) {
        this.loadDrawer = true
        const names = name.split('_')
        this.drawerTitle = dic[names[0]] + dic[names[1]]
        this.actionName = name
        this.drawerShow = true
        setTimeout(() => {
          this.loadDrawer = false
        }, 500)
      } else {
        switch (name) {
          case 'recent_read':
            this.loadPieceRecent('view')
            break
          case 'recent_collect':
            this.loadPieceRecent('create')
            break
          case 'search':
            this.$bus.emit('switchPowerMode', 9)
            break
        }
      }
    },
    showCategoryItems (category, title) {
      const params = {
        category: category
      }
      this.showList(title, 'category-items', params)
    },
    showAuthorItems (author, dynasty, title) {
      const params = {
        author: author,
        dynasty: dynasty
      }
      this.showList(title, 'author-items', params)
    },
    loadSeries (item, callback) {
      setTimeout(() => {
        if (item.last_level === 0) {
          this.$http.post('/api/getChildSeries', {
            book: this.selectedBook.id,
            parent: item.id
          })
            .then(response => {
              const data = response.data.map(subItem => {
                return {
                  id: subItem.id,
                  title: subItem.title,
                  last_level: subItem.last_level,
                  loading: false,
                  children: []
                }
              })
              if (data.length === 0) {
                item.last_level = 1
                this.loadPiece(item, callback)
                return
              }
              callback(data)
            })
            .catch(error => {
              console.log(error)
            })
            .finally(() => { })
        } else {
          this.loadPiece(item, callback)
        }
      }, 100)
    },
    loadPiece (item, callback) {
      this.$http.post('/api/allPiece', {
        series: item.id
      }).then(response => {
          const data = response.data.map(subItem => {
            return {
              id: subItem.id,
              title: subItem.title,
              is_piece: true
            }
          })
          callback(data)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {})
    },
    showPiece (id) {
      this.loadingContent = true
      this.readBookId = ''
      setTimeout(() => {
        this.viewPieceId = id
        this.loadingContent = false
        savePieceHistory({'id': id})
        setInterval(() => {
          updatePieceNumber({'id': id, 'type': 'duration'})
        }, 60000);
      }, 300)
    },
    // 对篇章进行各项操作
    actionPiece (name, id) {
      this.pieceToDo = id
      switch (name) {
        case 'view':
          this.showPiece(id)
          break
        case 'modify':
        case 'edit':
        case 'relate':
        case 'record':
          this.action(name + '_piece_drawer')
          break
      }
    },
    showBook (id) {
      this.loadingContent = true
      setTimeout(() => {
        this.readBookId = id
        this.loadingContent = false
        saveBookHistory({'id': id})
        setInterval(() => {
          updateBookNumber({'id': id, 'type': 'duration'})
        }, 60000);
      }, 300)
    },
    // 对书籍进行各项操作
    actionBook (name, id) {
      this.bookToDo = id
      switch (name) {
        case 'read':
          this.showBook(id)
          break
        case 'modify':
          this.action(name + '_book_drawer')
          break
      }
    },
    addPieceRelate (type, id) {
      if (this.isReadMode) {
        this.isReadMode = false
      }
      this.relateType = type
      setTimeout(() => {
        this.actionPiece('relate', id)
      }, 500)
    },
    showList (title, type, params) {
      this.listData = null
      setTimeout(() => {
        this.listData = {
          title: title,
          type: type,
          params: params
        }
      }, 300)
    },
    refresh (id) {
      if (id == this.viewPieceId) {
        this.showPiece(id)
      }
    },
    submit () {
      this.$refs[this.actionName].submit()
    },
    changeMode () {
      this.isReadMode = !this.isReadMode
    },
    randomPiece () {
      getPieceRandom().then(res => {
        if (res) {
          this.showPiece(res[0]._id)
        }
      })
    },
    back () {
      this.actionName = ''
      this.drawerShow = false
    }
  }
}
</script>
<style lang="less" scoped>
.menu {
  margin: 0 auto;
  height: calc(100vh - 100px - 48px);
  background: transparent;
  &:after {
    width: 0px;
  }
  .sub-menu {
    margin-left: 24px;
  }
}
.sider {
  background: @white-bg;
  .sider-title {
    text-align: center;
    height: @list-header-height;
    line-height: @list-header-height;
    font-size: @title-size;
    font-weight: bold;
    color: @iview-color;
  }
}
.layout {
  width: 100%;
  height: 100vh;
}
.layout-main-mode {
  width: 100%;
  background: transparent;
  .content {
    display: flex;
    .content-left {
      display: inline-block;
      width: 360px;
      height: 100vh;
      z-index: 3;
    }
    .content-right {
      width: calc(100% - 360px);
      height: 100vh;
      .flex-center();
    }
    .sider-switch {
      position: absolute;
      bottom: 12px;
      right: 12px;
    }
  }
}
.layout-read-mode {
  .flex-center();
  height: 100vh;
  background: transparent;
}
.book {
  width: 160px;
  height: 200px;
  margin: 0 auto;
}
.book-selected {
  background: @primary-color;
  p {
    color: white;
  }
}
.dashboard {
  .center-horizontal();
  bottom: 24px;
}
.ivu-menu-item-active:not(.ivu-menu-submenu) {
  background: none!important;
  &:after {
    background: none!important;
  }
}
</style>
