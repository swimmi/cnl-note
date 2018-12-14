<template>
<div class="layout">
  <Layout v-if="!isReadMode" class="layout-main-mode">
    <Sider class="sider" width="300">
      <Menu width="auto" active-name="recent_read" :open-names="['recent']" accordion class="menu" @on-select="action">
        <Submenu name="recent">
            <template slot="title">
              {{ $str.recent }}
            </template>
            <MenuItem name="recent_read"><span>{{ $str.read }}</span></MenuItem>
            <MenuItem name="recent_add"><span>{{ $str.add }}</span></MenuItem>
        </Submenu>
        <Submenu name="add">
            <template slot="title">
              {{ $str.add_all }}
            </template>
            <MenuItem name="add_author_drawer"><span>{{ $str.add_author }}</span></MenuItem>
            <MenuItem name="add_piece_drawer"><span>{{ $str.add_piece }}</span></MenuItem>
            <MenuItem name="add_book_drawer"><span>{{ $str.add_book }}</span></MenuItem>
            <MenuItem name="collect_book_drawer"><span>{{ $str.collect_book }}</span></MenuItem>
        </Submenu>
        <Submenu name="search">
            <template slot="title">
              {{ $str.search }}
            </template>
            <MenuItem name="search_piece_drawer"><span>{{ $str.piece }}</span></MenuItem>
            <MenuItem name="search_book_drawer"><span>{{ $str.book }}</span></MenuItem>
            <MenuItem name="search_author_drawer"><span>{{ $str.author }}</span></MenuItem>
        </Submenu>
        <dash-board class="dashboard"></dash-board>
      </Menu>
    </Sider>
    <Content class="content">
      <Row>
        <Col span="8" class="content-left">
          <piece-list v-if="resultList != null" :list="resultList"></piece-list>
        </Col>
        <Col span="16" class="content-right">
          <Spin size="large" class="center-parent" v-if="loadingPiece"></Spin>
          <piece-view v-else :piece="selectedPiece" class="content-piece animated bounceInLeft"></piece-view>
          <div class="sider-switch">
            <Switch v-model="showCategory" size="large">
              <span slot="open">{{ showIndex ? '索引':'目录' }}</span>
              <span slot="close">{{ showIndex ? '索引':'目录' }}</span>
            </Switch><br/>
            <Switch v-model="showBooks" size="large" :style="{marginTop: '8px'}">
              <span slot="open">书籍</span>
              <span slot="close">书籍</span>
            </Switch>
          </div>
        </Col>
      </Row>
    </Content>
    <div v-show="showCategory">
      <Sider v-show="!showIndex" class="sider">
        <Divider><span v-if="selectedBook !== null">{{ selectedBook.title + '-' }}</span>{{ $str.category }}</Divider>
        <Tree :data="bookSeries" :load-data="loadSeries" @on-select-change="selectSeries"></Tree>
        <div style="margin-top: 48px">
          <Button long :loading="loadingPiece" v-show="selectedPieceId > 0" @click="viewPiece(selectedPieceId)">
            <span v-if="!loadingPiece">{{ $str.read }}</span>
            <span v-else>{{ $str.loading }}</span>
          </Button>
          <Button style="margin-top: 8px" long @click="showIndex = true; selectedBook = null">{{ $str.back }}</Button>
        </div>
      </Sider>
      <Sider v-show="showIndex" class="sider">
        <index-category @selectCategory="showCategoryBooks" @selectAuthor="showAuthorBooks"></index-category>
      </Sider>
    </div>
    <Sider v-show="showBooks" class="sider">
      <Divider><span v-if="selectedCategory !== ''">{{ selectedCategory + '-' }}</span>{{ $str.book }}</Divider>
      <book-item
        v-for="(item, index) in bookList"
        :key="index"
        :book="item"
        @click.native="selectBook(item)">
      </book-item>
    </Sider>
    <Drawer ref="drawer" placement="left" :closable="false" v-model="showDrawer" :width="drawerWidth" @on-close="back" class="drawer">
      <Divider>{{ drawerTitle }}</Divider>
      <section v-if="actionName === 'add_author_drawer'"><add-author></add-author></section>
      <section v-else-if="actionName === 'add_book_drawer'"><add-book></add-book></section>
      <section v-else-if="actionName === 'collect_book_drawer'"><collect-book></collect-book></section>
      <section v-else-if="actionName === 'add_piece_drawer' || actionName === 'modify_piece'"><piece-add :id="actionName === 'modify_piece' ? pieceToDo : ''"></piece-add></section>
      <section v-else-if="actionName === 'edit_piece_drawer'"><piece-edit :id="pieceToDo"></piece-edit></section>
      <section v-else-if="actionName === 'relate_piece'"><piece-relate :id="pieceToDo"></piece-relate></section>
      <section v-else-if="actionName === 'search_piece_drawer'"><piece-search @result="returnResult"></piece-search></section>
    </Drawer>
  </Layout>
  <div v-else class="layout-read-mode animated zoomInUp">
      <piece-view :piece="selectedPiece" :readMode="true"></piece-view>
  </div>
</div>
</template>
<script>
import AddAuthor from '@/components/pages/author/add'
import AddBook from '@/components/pages/book/add'
import CollectBook from '@/components/pages/book/collect'
// 篇章操作相关组件
import PieceAdd from '@/components/pages/piece/add'
import PieceEdit from '@/components/pages/piece/edit'
import PieceSearch from '@/components/pages/piece/search'
import PieceRelate from '@/components/pages/piece/relate'
import PieceView from '@/components/pages/piece/view'

import IndexCategory from '@/components/pages/category'
import PieceList from '@/components/widgets/list/piece'
import BookItem from '@/components/widgets/item/book'
import DashBoard from '@/components/widgets/DashBoard'

import { getPiece, getPieceRecent } from '@/api/piece'
export default {
  components: {
    AddBook,                // 添加书籍
    AddAuthor,              // 添加作者
    CollectBook,            // 编撰书籍
    IndexCategory,          // 目录索引
    PieceList,              // 搜索结果
    PieceAdd,               // 添加篇章
    PieceEdit,              // 编辑篇章
    PieceSearch,            // 搜索篇章
    PieceRelate,            // 篇章相关
    PieceView,              // 查看篇章
    BookItem,
    DashBoard
  },
  inject: ['reload'],
  props: {
    piece: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      title: '吉光片羽',     // 主标题
      subtitle: '国学笔记',  // 副标题
      actionName: 'index',  // 触发drawer操作名称
      resultName: '',       // 显示结果类型名称
      resultList: null,       // 显示结果列表
      showDrawer: false,    // 是否显示drawer
      showIndex: true,      // 是否显示分类索引
      showCategory: false,  // 是否显示右侧目录索引
      showBooks: false,     // 是否现在右侧书籍列表
      loadingPiece: true,   // 是否正在加载篇章
      bookList: [],         // 当前展示的书籍列表
      selectedBook: null,   // 当前选中的书籍
      selectedCategory: '', // 当前选中的索引目录
      selectedPieceId: this.piece._id,   // 当前选中的篇章id
      selectedPiece: this.piece,  // 当前选中的篇章
      drawerTitle: '',
      bookSeries: [],       // 书籍卷册
      pieceToDo: '',        // 待操作的篇章
      isReadMode: true     // 阅读模式
    }
  },
  mounted () {
    this.init()
  },
  watch: {
  },
  computed: {
    drawerWidth: function() {
      if (['add_piece_drawer', 'edit_piece_drawer', 'relate_piece_drawer', 'collect_book_drawer'].indexOf(this.actionName) > -1) {
        return 600
      }
      return 400
    }
  },
  methods: {
    init () {
      this.$bus.on('actionPiece', this.actionPiece)
      this.$bus.on('back', this.back)
      this.$bus.on('reload', this.reload)
      this.$bus.on('refresh', this.refresh)
      this.$bus.on('changeMode', this.changeMode)
      this.loadPieceRecent(0)
      this.initCategory()
      this.selectedPiece = this.piece
      this.selectedPieceId = this.piece._id
      this.loadingPiece = false
      document.onkeyup = (event) => {
        let e = event || window.event || arguments.callee.caller.arguments[0]
        if (e && e.keyCode == 32 && event.target.tagName == 'BODY') {
          this.changeMode()
        }
      }
    },
    loadPieceRecent (val) {
      getPieceRecent({'type': val}).then(res => {
        this.resultList = {
          data: res,
          type: val
        }
      })
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
        'search': this.$str.search,
        'edit': this.$str.edit,
        'modify': this.$str.modify,
        'content': this.$str.content,
        'author': this.$str.author,
        'book': this.$str.book,
        'collect': this.$str.collect,
        'piece': this.$str.piece,
        'relate': this.$str.relate
      }
      if (name.indexOf('drawer') > -1) {
        const names = name.split('_')
        this.drawerTitle = dic[names[0]] + dic[names[1]]
        this.actionName = name
        this.showDrawer = true
      } else {
        switch (name) {
          case 'recent_read':
            this.loadPieceRecent(0)
            break
          case 'recent_add':
            this.loadPieceRecent(1)
            break
        }
      }
    },
    showCategoryBooks (category, title) {
      this.selectedCategory = title
      this.$http.post('/api/getCategoryBooks', {
        category: category
      })
        .then(response => {
          this.bookList = response.data
        })
        .catch(error => {
          console.log(error)
        })
    },
    showAuthorBooks (author, title, dynasty) {
      this.selectedCategory = title
      this.$http.post('/api/getAuthorBooks', {
        author: author,
        dynasty: dynasty
      })
        .then(response => {
          this.bookList = response.data
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => { })
    },
    selectBook (book) {
      this.selectedBook = book
      this.showIndex = false
      this.initCategory()
    },
    selectSeries: function (item) {
      if (item.length > 0) {
        if (!item[0].hasOwnProperty('loading')) {
          this.selectedPieceId = item[0].id
        } else {
          this.selectedPieceId = 0
        }
      } else {
        this.selectedPieceId = 0
      }
    },
    updateSeries () {
      this.initCategory()
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
    viewPiece (id) {
      this.loadingPiece = true
      getPiece({id: id}).then(res => {
        this.selectedPiece = res
        this.loadingPiece = false
      })
    },
    // 对篇章进行各项操作
    actionPiece (name, id) {
      this.pieceToDo = id
      switch (name) {
        case 'view':
          this.viewPiece(id)
          break
        case 'modify':
        case 'edit':
        case 'relate':
          this.action(name + '_piece')
          break
      }
    },
    returnResult (name, list) {
      this.resultName = name
      this.resultList = {
        data: list
      }
      this.showDrawer = false
    },
    refresh (id) {
      if (id == this.selectedPieceId) {
        this.viewPiece(this.selectedPieceId)
      }
    },
    changeMode () {
      this.isReadMode = !this.isReadMode
    },
    back () {
      this.actionName = ''
      this.showDrawer = false
    }
  }
}
</script>
<style lang="less" scoped>
.menu {
  margin: 0 auto;
  height: 100%;
  background: transparent;
  &:after {
    width: 0px;
  }
  .sub-menu {
    margin-left: 24px;
  }
}
.sider {
  height: 100vh;
  background: transparent;
  padding: 12px;
}
.layout {
  width: 100%;
  height: 100vh;
}
.layout-main-mode {
  height: 100vh;
  background: transparent;
  .content {
    .content-left {
      height: 100vh;
      z-index: 3;
    }
    .content-right {
      height: 100vh;
      display: -webkit-flex;
      display: flex;
      -webkit-justify-content: center;
      justify-content: center;
      align-items: center;
    }
    .sider-switch {
      position: absolute;
      bottom: 12px;
      right: 12px;
    }
  }
}
.layout-read-mode {
  display: -webkit-flex;
  height: 100vh;
  -webkit-justify-content: center;
  justify-content: center;
  align-items: center;
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
  width: 150px;
  bottom: 12px;
}
.ivu-menu-item-active:not(.ivu-menu-submenu) {
  background: none!important;
  color: @primary-color!important;
  &:after {
    background: @primary-color!important;
  }
}
.drawer {
  background: transparent;
}
</style>
