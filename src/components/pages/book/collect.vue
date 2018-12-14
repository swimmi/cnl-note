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
              style="width: 300px"
              @on-change="selectedBook"
              :placeholder="$str.collect_book_tip"
              :remote-method="queryBooks"
              :loading="loadingBook">
              <Option v-for="(item, index) in bookList" :value="item.value" :key="index">{{ item.label }}</Option>
            </Select>
          </div>
          <div class="panel-btn" @click.stop>
            <Button v-if="book != ''" @click="addChild()" size="small"><Icon type="md-add" color="green"/></Button>
          </div>
          <div slot="content">
            <span class="content-tip">{{ $str.collect_piece_tip}}</span>
            <Collapse accordion v-if="catalog.length > 0">
              <Panel class="panel" v-for="(item, index) in catalog" :key="index">
                <div class="panel-title" @click.stop>
                  <Input style="width: 120px" v-model="item.title"/>
                  <Checkbox v-model="item.show_desc">{{ $str.prologue }}</Checkbox>
                </div>
                <div class="panel-btn" @click.stop>
                  <Button @click.stop="collectPiece(item)" size="small"><Icon type="md-folder" /></Button>
                  <Button @click="addChild(item)" size="small"><Icon type="md-add" color="green"/></Button>
                  <Button @click="removeChild(catalog, item)" size="small"><Icon type="md-remove" color="red"/></Button>
                </div>
                <div slot="content">
                  <Input class="prologue-input" type="textarea" v-show="item.show_desc" v-model="item.desc" :autosize="{minRows: 3,maxRows: 8}" :placeholder="$str.input_tip + $str.prologue"></Input>
                  <span v-if="item.pieces.length == 0" class="content-tip">{{ $str.collect_piece_tip}}</span>
                  <div v-else class="piece-container">
                    <Tag v-for="(piece, index) in item.pieces" :key="index" type="dot">{{ piece.title }}</Tag>
                    <Badge :count="item.pieces.length"></Badge>
                  </div>
                  <Collapse accordion v-if="item.children.length > 0">
                    <Panel v-for="(subitem, index) in item.children" :key="index">
                      <div class="panel-title" @click.stop>
                        <Input style="width: 120px" v-model="subitem.title"/>
                        <Checkbox v-model="subitem.show_desc">{{ $str.prologue }}</Checkbox>
                      </div>
                      <div class="panel-btn" @click.stop>
                        <Button @click="collectPiece(subitem)" size="small"><Icon type="md-folder" /></Button>
                        <Button @click="addChild(subitem)" size="small"><Icon type="md-add" color="green"/></Button>
                        <Button @click="removeChild(item.children, subitem)" size="small"><Icon type="md-remove" color="red" /></Button>
                      </div>
                      <div slot="content">
                        <Input class="prologue-input" type="textarea" v-show="subitem.show_desc" v-model="subitem.desc" :autosize="{minRows: 3,maxRows: 8}" :placeholder="$str.input_tip + $str.prologue"></Input>
                        <div class="piece-container">
                          <Tag v-for="(piece, index) in subitem.pieces" :key="index" type="dot">{{ piece.title }}</Tag>
                          <Badge :count="subitem.pieces.length"></Badge>
                        </div>
                        <Collapse v-if="subitem.children.length > 0">
                          <Panel v-for="(granditem, index) in subitem.children" :key="index">
                            <div class="panel-title" @click.stop>
                              <Input style="width: 120px" v-model="granditem.title"/>
                              <Checkbox v-model="granditem.show_desc">{{ $str.prologue }}</Checkbox>
                            </div>
                            <div class="panel-btn" @click.stop>
                              <Button @click="collectPiece(granditem)" size="small"><Icon type="md-folder" color="green"/></Button>
                              <Button @click="removeChild(subitem.children, granditem)" size="small"><Icon type="md-remove" color="red" /></Button>
                            </div>
                            <div slot="content">
                              <Input class="prologue-input" type="textarea" v-show="granditem.show_desc" v-model="granditem.desc" :autosize="{minRows: 3,maxRows: 8}" :placeholder="$str.input_tip + $str.prologue"></Input>
                              <div class="piece-container">
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
    <FormItem>
      <Button type="primary" @click="submit">{{ $str.submit }}</Button>
      <Button style="margin-left: 8px" @click="$bus.emit('back')">{{ $str.back }}</Button>
    </FormItem>
    <Drawer width="300" :title="$str.select_tip + $str.piece" placement="left" :closable="false" v-model="showDrawer">
      <Form class="drawer-form">
        <FormItem>
          <Select
            v-model="pieceTitle"
            filterable
            remote
            label-in-value
            @on-change="selectedPiece"
            :remote-method="queryPieces"
            :loading="loadingPiece">
            <Option v-for="(item, index) in pieceList" :value="item.value" :key="index">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <div class="piece-span-container" ref="spanContainer">
            <span
              class="piece-span"
              v-for="(piece, index) in pieces"
              :key="index" draggable='true'
              @dragstart='drag($event)'
              @drop='drop($event)'
              @dragover='allowDrop($event)'>
              <i class="float-left">{{ index + 1 }}</i>
              {{ piece.title }}
              {{ piece.brief }}
              <Icon class="float-right" type="md-close" color="red" @click="removePiece(index)"/>
            </span>
          </div>
        </FormItem>
      </Form>
    </Drawer>
  </Form>
</template>
<script>
import { allBook, getCatalog, updateCatalog } from '@/api/book'
import { allPiece } from '@/api/piece'
export default {
  data () {
    return {
      book: '',
      catalog: [],
      pieces: [],
      loadingBook: false,
      allBooks: [],
      bookList: [],
      loadingPiece: false,
      allPieces: [],
      pieceList: [],
      pieceTitle: '',
      showDrawer: false,
      // 拖拽排序
      moveDom: '',
      changeDom: '',
      startY: 0,
      endY: 0,
      loading: true
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
        desc: null,
        children: [],
        pieces: []
      }
      if (item) {
        item.children.push(child)
      } else {
        this.catalog.push(child)
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
      this.showDrawer = true
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
      var piece = {
        id: val.value,
        title: val.label
      }
      this.pieces.push(piece)
      this.pieceTitle = ''
    },
    removePiece (index) {
      this.pieces.splice(index, 1)
    },
    // 拖拽排序
    drag: function (event) {
      this.moveDom = event.currentTarget
      this.startY = event.clientY
    },
    drop: function (event) {
      event.preventDefault()
      this.changeDom = event.currentTarget
      console.log(this.changeDom.parent)
      this.endY = event.clientY
      if (this.endY - this.startY >= 0) {
        this.$refs.spanContainer.insertBefore(this.moveDom, this.changeDom.nextSibling)
      } else {
        this.$refs.spanContainer.insertBefore(this.moveDom, this.changeDom)
      }
    },
    allowDrop: function (event) {
      event.preventDefault()
      this.endY = event.clientY
      this.changeDom = event.currentTarget
      if (this.endY - this.startY >= 0) {
        this.$refs.spanContainer.insertBefore(this.moveDom, this.changeDom.nextSibling)
      } else {
        this.$refs.spanContainer.insertBefore(this.moveDom, this.changeDom)
      }
    },
    submit () {
      updateCatalog({'book': this.book, 'catalog': this.catalog}).then(res => {
        console.log(res)
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
  .piece-container {
    margin-bottom: 12px;
  }
}
.piece-span-container {
  width: 100%;
  height: calc(100vh - 300px);
  border-radius: @base-radius;
  border: 1px @border-color solid;
  .piece-span {
    display: block;
    border: 1px @border-color solid;
    border-radius: @base-radius;
    padding: 4px 8px;
    font-size: @subtext-size;
    text-align: center;
    cursor: pointer;
    margin: 8px;
    &:hover {
      background-color: @card-bg;
    }
  }
}
</style>
