<template>
  <Spin v-if="loading" class="center-parent" />
  <Form v-else ref="book" class="drawer-form">
    <FormItem>
      <Collapse accordion value="0">
        <Panel class="panel" name="0">
          <div class="panel-title" @click.stop>
            <Select
              v-model="book"
              filterable
              remote
              style="width: 160px"
              @on-change="selectedBook"
              :placeholder="$str.collect_book_tip"
              :remote-method="queryBooks"
              :loading="loadingBook">
              <Option v-for="(item, index) in bookList" :value="item.value" :key="index">{{ item.label }}</Option>
            </Select>
          </div>
          <div v-if="book != ''" class="panel-btn" @click.stop>
            <Input v-show="templateCount > 0" size="small" style="width: 160px" v-model="templateString" :placeholder="$str.template_tip"></Input>
            <InputNumber size="small" style="width: 60px" v-model="templateCount" :max="100" :min="0"></InputNumber>
            <Button @click="addChild()" size="small"><Icon type="md-add" color="green"/></Button>
          </div>
          <div slot="content">
            <Collapse accordion v-if="catalog.length > 0">
              <Panel class="panel" v-for="(item, index) in catalog" :key="index">
                <div class="panel-title" @click.stop>
                  <Input style="width: 120px" size="small" v-model="item.title"/>
                  <Checkbox v-model="item.show_desc">{{ $str.prologue }}</Checkbox>
                </div>
                <div class="panel-btn" @click.stop>
                  <Button @click.stop="collectPiece(item)" size="small"><Icon type="md-folder" /></Button>
                  <Button @click="addChild(item)" size="small"><Icon type="md-add" color="green"/></Button>
                  <Button @click="removeChild(catalog, item)" size="small"><Icon type="md-remove" color="red"/></Button>
                </div>
                <div slot="content">
                  <Input class="prologue-input" type="textarea" v-show="item.show_desc" v-model="item.desc" :autosize="{minRows: 3,maxRows: 8}" :placeholder="$str.input_tip + $str.prologue"></Input>
                  <div v-if="item.pieces.length > 0" class="piece-container">
                    <Tag v-for="(piece, index) in item.pieces" :key="index" type="dot">{{ piece.title }}</Tag>
                    <Badge :count="item.pieces.length"></Badge>
                  </div>
                  <Collapse accordion v-if="item.children.length > 0">
                    <Panel class="panel" v-for="(subitem, index) in item.children" :key="subitem.title">
                      <div class="panel-title" @click.stop>
                        <Input style="width: 120px" size="small" v-model="subitem.title"/>
                        <Checkbox v-model="subitem.show_desc">{{ $str.prologue }}</Checkbox>
                      </div>
                      <div class="panel-btn" @click.stop>
                        <Button @click="collectPiece(subitem)" size="small"><Icon type="md-folder" /></Button>
                        <Button @click="addChild(subitem)" size="small"><Icon type="md-add" color="green"/></Button>
                        <Button @click="removeChild(item.children, subitem)" size="small"><Icon type="md-remove" color="red" /></Button>
                      </div>
                      <div slot="content">
                        <Input class="prologue-input" type="textarea" v-show="subitem.show_desc" v-model="subitem.desc" :autosize="{minRows: 3,maxRows: 8}" :placeholder="$str.input_tip + $str.prologue"></Input>
                        <div v-if="subitem.pieces.length > 0" class="piece-container">
                          <Tag v-for="(piece, index) in subitem.pieces" :key="index" type="dot">{{ piece.title }}</Tag>
                          <Badge :count="subitem.pieces.length"></Badge>
                        </div>
                        <Collapse v-if="subitem.children.length > 0">
                          <Panel class="panel" v-for="(granditem, index) in subitem.children" :key="granditem.title">
                            <div class="panel-title" @click.stop>
                              <Input style="width: 120px" size="small" v-model="granditem.title"/>
                              <Checkbox v-model="granditem.show_desc">{{ $str.prologue }}</Checkbox>
                            </div>
                            <div class="panel-btn" @click.stop>
                              <Button @click="collectPiece(granditem)" size="small"><Icon type="md-folder"/></Button>
                              <Button @click="removeChild(subitem.children, granditem)" size="small"><Icon type="md-remove" color="red" /></Button>
                            </div>
                            <div slot="content">
                              <Input class="prologue-input" type="textarea" v-show="granditem.show_desc" v-model="granditem.desc" :autosize="{minRows: 3,maxRows: 8}" :placeholder="$str.input_tip + $str.prologue"></Input>
                              <div v-if="granditem.pieces.length > 0" class="piece-container">
                                <Tag v-for="(piece, index) in granditem.pieces" :key="index" type="dot">{{ piece.title }}</Tag>
                                <Badge :count="granditem.pieces.length"></Badge>
                              </div>
                            </div>
                          </Panel>
                        </Collapse>
                      </div>
                    </Panel>
                  </Collapse>
                </div>
              </Panel>
            </Collapse>
          </div>
        </Panel>
      </Collapse>
    </FormItem>
    <Drawer
      v-model="showDrawer"
      @on-close="closeDrawer"
      :closable="false"
      placement="left"
      width="400"
      class="drawer"
      :styles="drawerStyles">
      <Form class="drawer-form">
        <FormItem>
          <Select
            ref="pieceSelect"
            v-model="pieceTitle"
            class="piece-select"
            clearable
            filterable
            remote
            label-in-value
            @on-change="selectedPiece"
            :remote-method="queryPieces"
            :loading="loadingPiece">
            <Option v-for="(item, index) in pieceList" :value="item.value" :key="index">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <div class="piece-span-container" ref="spanContainer">
          <draggable v-model="orderPieces">
            <transition-group enter-active-class="animated flipInX" leave-active-class="animated flipOutX">
              <span
                class="piece-span"
                v-for="(piece, index) in orderPieces"
                :key="piece._id"
                draggable='true'
                :title="$str.drag + $str.sort">
                <b class="float-left">{{ index + 1 }}.</b>
                <span class="piece-title">{{ piece.title }}</span>
                <Icon class="remove-btn" type="md-close" @click="removePiece(index)" :title="$str.remove + $str.piece"/>
              </span>
            </transition-group>
          </draggable>
        </div>
      </Form>
    </Drawer>
  </Form>
</template>
<script>
import { allBook, getCatalog, updateCatalog } from '@/api/book'
import { allPiece } from '@/api/piece'
import draggable from 'vuedraggable'
export default {
  components: {
    draggable
  },
  data () {
    return {
      book: '',
      catalog: [],
      pieces: [],
      orderPieces: [],
      loadingBook: false,
      allBooks: [],
      bookList: [],
      loadingPiece: false,
      allPieces: [],
      pieceList: [],
      pieceTitle: '',
      showDrawer: false,
      templateString: '',
      templateCount: 0,
      loading: true,
      drawerStyles: {
        background: 'url(static/images/drawer_bg.jpg)',
        backgroundPosition: '50%',
        backgroundSize: 'cover',
        animation: 'bgFloatH 60s ease-in-out infinite'
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 获取书籍列表以供选择
      allBook().then(res => {
        this.allBooks = res.map(item =>  {
          return {
            value: item._id,
            label: item.title
          }
        })
        this.loading = false
      })
    },
    queryBooks (query) {
      if (query !== '') {
        this.loadingBook = true
        setTimeout(() => {
          this.loadingBook = false
          this.bookList = this.allBooks.filter(item => item.label.indexOf(query) > -1)
        }, 200)
      } else {
        this.bookList = []
      }
    },
    removeChild (item, subitem) {
      var index = item.indexOf(subitem)
      item.splice(index, 1)
    },
    addChild (item) {
      var child = {
        title: '',
        show_desc: false,
        desc: '',
        children: [],
        pieces: []
      }
      if (item) {
        item.children.push(child)
      } else {
        if (this.templateCount > 0 && this.templateString.indexOf('n') != -1) {
          // 批量添加卷册
          for(var i = 0; i < this.templateCount; i++) {
            var c = {
              title: this.templateString.replace('n', this.$util.parseNumber(i + 1)),
              show_desc: false,
              desc: '',
              children: [],
              pieces: []
            }
            this.catalog.push(c)
          }
        } else {
          this.catalog.push(child)
        }
      }
    },
    selectedBook (val) {
      getCatalog({'book': val}).then(res => {
        this.catalog = res.catalog
      })
    },
    collectPiece (item) {
      // 获取篇章列表以供选择
      allPiece().then(res => {
        this.allPieces = res.map(item =>  {
          return {
            value: item._id,
            label: item.title
          }
        })
        this.loading = false
      })
      this.pieces = item.pieces
      this.orderPieces = item.pieces.slice()
      this.showDrawer = true
      this.scrollToBottom()
    },
    queryPieces (query) {
      if (query !== '') {
        this.loadingPiece = true
        setTimeout(() => {
          this.loadingPiece = false
          this.pieceList = this.allPieces.filter(item => item.label.indexOf(query) > -1)
        }, 200)
      } else {
        this.pieceList = []
      }
    },
    filterPiece (value, data) {
      return data.indexOf(value) !== -1
    },
    selectedPiece (val) {
      if (val) {
        var piece = {
          _id: val.value,
          title: val.label
        }
        this.orderPieces.push(piece)
        this.pieces.push(piece)
        this.$refs.pieceSelect.clearSingleSelect()
        this.scrollToBottom()
      }
    },
    scrollToBottom () {
      setTimeout(() => {
        this.$refs.spanContainer.scrollTop = this.$refs.spanContainer.scrollHeight
      }, 300)
    },
    removePiece (index) {
      this.orderPieces.splice(index, 1)
      this.pieces.splice(index, 1)
    },
    closeDrawer () {
      for (var i = 0; i < this.orderPieces.length; i++) {
        this.pieces[i] = this.orderPieces[i]
      }
    },
    submit () {
      updateCatalog({'book': this.book, 'catalog': this.catalog}).then(res => {
        this.$Message.success(this.$str.submit_success)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.panel {
  width: 100%;
  .panel-title {
    display: inline-block;
  }
  .panel-btn {
    float: right;
    margin-right: 12px;
  }
  .prologue-input {
    margin-bottom: 16px;
  }
  .content-tip {
    display: block;
    width: 100%;
    text-align: right;
    color: @text-grey;
  }
}
.piece-select {
  margin-top: 16px;
}
.piece-span-container {
  width: 100%;
  height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: @base-radius;
  border: 1px @border-color solid;
  .piece-span {
    position: relative;
    display: block;
    border: 1px @primary-color solid;
    border-radius: @base-radius;
    padding: 8px 12px;
    font-size: @subtext-size;
    text-align: center;
    cursor: pointer;
    margin: 8px;
    background-color: @white-bg;
    &:hover {
      background-color: @card-bg;
    }
    .piece-title {
      display: block;
      width: calc(100% - 60px);
      margin: 0 auto;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .remove-btn {
      .center-vertical();
      right: 8px;
      color: @bookmark-color;
    }
  }
}
</style>
