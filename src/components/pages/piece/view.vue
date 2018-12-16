<template>
  <Spin v-if="loading"/>
  <div v-else class="piece-page" ref="page">
    <div class="piece-space">
      <Icon
        class="page-expand"
        :type="readMode?'ios-paper-outline':'ios-book-outline'"
        size="24"
        color="#333"
        :title="(readMode?$str.browse:$str.read) + $str.mode"
        @click="expandPage"/>
      <div class="page-control">
        <Icon
          class="page-prev"
          v-show="pageIndex > 0"
          type="ios-arrow-up"
          size="24"
          @click="pageIndex--" />
        <span class="page-number v-title">{{ $util.parseNumber(pageIndex + 1) }}</span>
        <Icon
          class="page-next"
          v-show="pageIndex < pages.length - 1"
          type="ios-arrow-down"
          size="24"
          @click="pageIndex++" />
      </div>
    </div>
    <div class="piece-content" :class="{'animated fadeIn': showPiece}">
      <div class="page animated fadeIn" v-show="pageIndex == pi" v-for="(page, pi) in pages" :key="pi">
        <div class="column" v-for="(column, index) in page">
          <span class="bookmark-space" :class="{'bookmark': indexBookmark(pi, index) > -1}" @click="bookmark(pi, index, column)" :title="$str.add + $str.bookmark"></span>
          <span
            class="v-text"
            :class="{'column-indent': isIndent(index), 'column-vice': isVice(pi, index), 'column-title': isTitle(pi, index)}">
            {{ column }}
          </span>
        </div>
        <div class="column" v-for="n in maxColumn - page.length"><span class="v-text"></span></div>
      </div>
      <div class="piece-stamp animated fadeIn" v-show="pageIndex == pages.length - 1"><span>{{ stampText(author) }}</span></div>
    </div>
    <div class="piece-title-container">
      <span class="v-title piece-title">{{ title }}</span>
      <div class="piece-content-title">
        <span
          v-for="(item, index) in contents"
          :key="index"
          class="v-title content-title"
          :class="{'selected': contentIndex === index}"
          @click="changeContent(index)">
          {{ [$str.char[0], $str.annotate[0], $str.translate[1], $str.comment[0], $str.appreciate[0]][index] }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { getPiece, getPieceRelate, addBookmark, removeBookmark, savePieceHistory } from '@/api/piece'
import { getBookContent } from '@/api/book'
export default {
  name: 'view-piece',
  props: {
    id: {
      type: String,
      required: true
    },
    isBook: {
      type: Boolean,
      required: true
    },
    readMode: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      title: '',
      srcContent: '',
      contents: new Array(5).fill(this.$str.no_content),
      contentIndex: 0,
      author: '',
      maxColumn: 8,
      maxRow: 8,
      pageIndex: 0,
      pages: [],
      indentColumns: [],
      viceColumns: [],
      titleColumns: [],
      bookmarks: [],
      cw: 0,
      ch: 0,
      showPiece: false,
      loading: true
    }
  },
  computed: {
    isIndent() {
      return function (index) {
        return this.indentColumns[this.pageIndex].indexOf(index) != -1
      }
    },
    isVice() {
      return function (pi, index) {
        return this.viceColumns.indexOf(pi * this.maxColumn + index) != -1
      }
    },
    isTitle() {
      return function (pi, index) {
        return this.titleColumns.indexOf(pi * this.maxColumn + index) != -1
      }
    }
  },
  mounted () {
    this.cw = document.documentElement.clientWidth;
    this.ch = document.documentElement.clientHeight;
    this.maxRow = Math.floor((this.ch * 0.9 - 50) / 22)
    if (this.readMode) {
      this.maxColumn = Math.floor((this.cw - 250) / 36)
    } else {
      this.maxColumn = Math.floor((this.cw - 900) / 36)
    }
    window.onresize = () => {
        this.cw = document.documentElement.clientWidth;
        this.ch = document.documentElement.clientHeight;
        if (this.readMode) {
          this.maxColumn = Math.floor((this.cw - 250) / 36)
          this.maxRow = Math.floor((this.ch * 0.9 - 50) / 22)
          if (this.maxColumn < 8) {
            this.maxColumn = 8
          }
          if (this.maxRow < 8) {
            this.maxRow = 8
          }
          this.showContent()
        } else {
          this.maxColumn = Math.floor((this.cw - 900) / 36)
        }
    }
    if (this.isBook) {
      getBookContent({'book': this.id}).then(res => {
        if (res) {
          this.title = res.title
          this.author = res.author.name.full
          res.catalog.forEach(item => {
            this.getItemContent(item)
          })
          this.contents[0] = this.srcContent
          this.showContent()
        }
      })
    } else {
      getPiece({'id': this.id}).then(res => {
        this.title = res.title
        this.author = res.author.name.full
        this.srcContent = res.content
        if (res.hasOwnProperty('bookmarks')) {
          this.bookmarks = res.bookmarks.map(item => {
            return Math.floor(item.col / this.maxColumn) + '-' + (item.col % this.maxColumn)
          })
        }
        // 加入题序
        // 加入相关内容
        res.relates.forEach(item => {
          this.contents[item.type + 1] = item.content
        })
        savePieceHistory({id: this.id})
        this.contents[0] = this.srcContent
        this.showContent()
      })
    }
  },
  methods: {
    fillTitle (title) {
      var n = title.length - 2
      return '┐ ' + '│ '.repeat(n) + `┘\n${title}\n┌ ` + '│ '.repeat(n) + '└'
    },
    getItemContent(item) {
      this.srcContent += this.fillTitle(item.title) + item.desc + '\n'
      item.pieces.forEach(piece => {
        this.srcContent += this.fillTitle(piece.title)  + piece.desc + '\n' + piece.content + '\n'
      })
      item.children.forEach(subitem => {
        this.getItemContent(subitem)
      })
    },
    showContent () {
      // 处理文本
      const text = this.contents[this.contentIndex]
      var columnIndex = 0
      // 段首缩进
      var paragraphs = text.split(/\n|\r\n/)
      this.indentColumns = []                 // 需缩进的行
      var indent = []                         // 每页缩进行
      var page = []                           // 页
      var content = []                        // 文
      paragraphs.forEach(element => {
        if (element.trim() != '') {
          for (var i = 0; i < element.length; i += this.maxRow) {
            if (i == 0) {
              element = '＠＠' + element
            }
            var c = element.slice(i, i + this.maxRow)
            // 句读加空格在前
            c = this.$util.parseColumn(c).replace('＠＠', '')
            if (c[0] == '┐') {
              this.titleColumns.push(content.length * this.maxColumn + columnIndex + 1)
            }
            page.push(c)
            columnIndex++
            if (columnIndex === this.maxColumn) {
              content.push(page)
              this.indentColumns.push(indent)
              indent = []
              page = []
              columnIndex = 0
            }
          }
          indent.push(columnIndex)
        }
      })
      if (page.length > 0) {
        content.push(page)
        this.indentColumns.push(indent)
      }
      if (this.indentColumns.length > 0) {
        this.indentColumns[0].push(0)
      }
      this.pages = content
      this.loading = false
    },
    indexBookmark: function (pi, ci) {
      return this.bookmarks.indexOf(pi + '-' + ci)
    },
    bookmark (pi, ci, column) {
      var i = this.indexBookmark(pi, ci)
      if (i > -1) {
        removeBookmark({
          id: this.id,
          col: ci + pi * this.maxColumn
        })
        this.bookmarks.splice(i, 1)
      } else {
        addBookmark({
          id: this.id,
          bookmark: {
            col: ci + pi * this.maxColumn,
            text: column,
            type: 1
          }
        })
        this.bookmarks.push(pi + '-' + ci)
      }
    },
    changeContent (index) {
      this.showPiece = true
      this.contentIndex = index
      this.pageIndex = 0
      this.srcContent = ''
      this.showContent()
      setTimeout(()=> {
        this.showPiece = false
      }, 1000)
    },
    expandPage () {
      this.$bus.emit('changeMode')
    },
    stampText (val) {
      if (val.length == 3) {
        val = val + '作'
      }
      if (val.length == 2) {
        val = val + '之作'
      }
      const str = val.charAt(2) + val.charAt(0) + val.charAt(3) + val.charAt(1)
      return str
    }
  }
}
</script>
<style lang="less" scoped>
.piece-page {
  @base-size: 24px;
  @text-size: 18px;
  @line-width: calc(@text-size * 2);
  @line-height: @text-size + 4px;
  @page-border-size: 4px;
  height: 90%;
  .piece-content {
    position: relative;
    display: inline-block;
    height: 100%;
    border: @page-border-size @primary-color solid;
    margin: 0px @base-size;
    .v-text {
      .v-title();
      line-height: @line-height;
      width: @text-size + 1px;
      font-size: @text-size;
      text-align: right;
    }
    .page {
      width: 100%;
      height: 100%;
      background-color: @paper-bg;
      .column-indent {
        position: relative;
        top: @line-height * 2;
      }
      .column {
        position: relative;
        float: right;
        height: 100%;
        padding: @base-size 8px;
        text-align: center;
        border-left: 1px @primary-color solid;
        color: @text-black;
        .decoration {
          position: absolute;
          display: block;
          width: @text-size + 2px;
          height: @line-height * 2;
        }
        .bookmark-space {
          .decoration();
          top: -@line-height * 1;
          cursor: pointer;
        }
        .bookmark {
          .decoration();
          top: -@line-height * 1;
          background: @bookmark-color;
          .bookmark-show();
        }
        .bookmark-show {
          animation: slide-down .2s ease-in 0s 1;
          @keyframes slide-down
          {
            from {height: 0px;}
            to {height: @line-height * 2;}
          }
          @-webkit-keyframes slide-down
          {
            from {height: 0px;}
            to {height: @line-height * 2;}
          }
        }
        .bookmark-hide {
          animation: slide-up .2s ease-out 0s 1;
          @keyframes slide-up
          {
            from {height: @line-height * 2;}
            to {height: 0px;}
          }
          @-webkit-keyframes slide-up
          {
            from {height: @line-height * 2;}
            to {height: 0px;}
          }
        }
        .column-vice {
          color: @text-vice;
          font-size: @subtitle-size;
        }
        .column-title {
          color: @text-black;
          font-size: @title-size;
          font-weight: bold;
        }
      }
    }
    .piece-stamp {
      position: absolute;
      width: 64px;
      height: 64px;
      bottom: 22px;
      left: 22px;
      font-family: 'Zhuanti';
      background-image: url('~st/images/stamp_bg.png');
      background-size: cover;
      span {
        display: block;
        text-align: center;
        padding: 4px;
        width: 100%;
        height: 100%;
        font-size: 24px;
        line-height: @title-height - 4px;
        color: @stamp-color;
      }
    }
  }
  .piece-title-container {
    display: inline-block;
    vertical-align: top;
    @title-padding: 16px;
    .v-title {
      width: @v-title-width + @title-padding * 1.5;
      text-align: center;
      line-height: calc(@text-size * 2);
      cursor: pointer;
    }
    .piece-title{
      background-color: @paper-bg;
      border: 4px @primary-color double;
      font-size: calc(@text-size * 1.2);
      &:hover {
        background: @card-bg;
      }
    }
    .piece-content-title {
      position: relative;
      top: @title-height;
      .content-title {
        margin-top: @title-height / 2;
        width: @v-title-width + @title-padding * 1.5;
        font-size: @text-size;
        line-height: calc(@text-size * 2);
        background-color: @paper-bg;
        &:hover {
          background-color: @card-bg;
        }
      }
      .selected {
        background-color: @primary-color;
        color: white;
        border: 1px @primary-color solid;
        &:hover {
          border: 1px @primary-color solid;
          background-color: lighten(@primary-color, 10%);
        }
      }
    }
  }
  .piece-space {
    position: relative;
    display: inline-block;
    vertical-align: top;
    height: 100%;
    .page-expand {
      .icon-btn();
    }
    .page-control {
      position: absolute;
      bottom: 0px;
      .page-prev {
        .icon-btn();
      }
      .page-next {
        .icon-btn();
      }
      .page-number {
        display: block;
        margin: 12px auto;
        line-height: @title-height;
        font-size: @font-middle;
        font-weight: bold;
        width: @font-middle;
      }
    }
  }
}
</style>
