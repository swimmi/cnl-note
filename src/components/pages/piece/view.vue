<template>
  <Spin v-if="loading"/>
  <div v-else class="piece-page" ref="page">
    <div class="piece-space">
      <div class="piece-action">
        <Icon
          class="icon-btn piece-action-btn"
          :type="readMode?'ios-paper':'ios-book'"
          size="24"
          color="#333"
          :title="(readMode?$str.browse:$str.read) + $str.mode"
          @click="expandPage"/>
        <Icon
          class="icon-btn piece-action-btn"
          type="ios-mic"
          size="24"
          :color="showRecordPlayer? 'red' : '#333'"
          :title="(showRecordPlayer? $str.stop : $str.start) + $str.record"
          @click="showRecordPlayer = !showRecordPlayer"/>
        <Icon
          class="icon-btn piece-action-btn"
          :type="isPlaying ? 'ios-pause' : 'ios-play'"
          size="24"
          color="red"
          :title="(isPlaying ? $str.pause : $str.resume) + $str.record"
          v-show="showRecordPlayer"
          @click="playRecord"/>
      </div>
      <div class="page-control">
        <Icon
          class="icon-btn"
          :class="{'icon-btn-disabled': pageIndex == 0}"
          type="ios-arrow-up"
          size="24"
          @click="if(pageIndex > 0) pageIndex--" />
        <span class="page-number v-title">{{ $util.parseNumber(pageIndex + 1) }}</span>
        <Icon
          class="icon-btn"
          :class="{'icon-btn-disabled': pageIndex == pages.length - 1}"
          type="ios-arrow-down"
          size="24"
          @click="if(pageIndex < pages.length - 1) pageIndex++" />
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
          <transition enter-active-class="flipInY" leave-active-class="flipOutY">
            <div
              class="column-mask animated"
              v-show="showRecordPlayer">
              <div class="column-mask-up" :style="`height: ${upHeight(column, index)}px`"></div>
              <div class="column-indicator" :style="`height: ${indicatorHeight(column, index)}px`" v-show="isPlayingColumn(pi, index)"></div>
              <div class="column-mask-down"></div>
            </div>
          </transition>
        </div>
        <div class="column" v-for="n in maxColumn - page.length">
          <span class="v-text">
            <transition enter-active-class="flipInY" leave-active-class="flipOutY">
            <div class="column-mask animated" v-show="showRecordPlayer"><div class="column-mask-down"></div></div>
          </transition>
          </span>
        </div>
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
import { getBookContent, saveBookHistory } from '@/api/book'
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
      fh: 22,               // 字高
      fw: 36,               // 字宽
      cw: 0,                // 窗口宽度
      ch: 0,                // 窗口高度
      showPiece: false,
      sentences: [],        // 句子
      sentenceIndex: 0,     // 句子索引
      showRecordPlayer: false,
      isPlaying: true,
      info: {               // 当前高亮处
        p: 0,               // 页码
        c: 0,               // 列数
        i: 0                // 高亮尾端位置，去除占位空格
      },
      isRowspan: false,     // 是否跨列
      audio: null,
      loading: true
    }
  },
  computed: {
    isIndent () {
      return function (index) {
        return this.indentColumns[this.pageIndex].indexOf(index) != -1
      }
    },
    isVice () {
      return function (pi, index) {
        return this.viceColumns.indexOf(pi * this.maxColumn + index) != -1
      }
    },
    isTitle () {
      return function (pi, index) {
        return this.titleColumns.indexOf(pi * this.maxColumn + index) != -1
      }
    },
    isPlayingColumn () {
      return function(pi, index) {
        const ci = this.info.p * this.maxColumn + this.info.c
        const i = pi * this.maxColumn + index
        if (i == ci) {
          return true
        } else if (this.isRowspan && i == ci - 1) {
          return true
        }
        return false
      }
    },
    upHeight () {
      return function (column, index) {
        const ccl = column.replace(/ /g, '').length
        const csl = this.currentSentence.replace(/ /g, '').length
        var len = 0
        if (!this.isRowspan) {
          len = this.info.i - csl
        } else {
          if (index != this.info.c) {
            len = ccl - (csl - this.info.i)
          }
        }
        len += 1  // 头部预留格
        if (this.isIndent(index)) {
          len += 2 // 缩进格
        }
        return len * this.fh
      }
    },
    indicatorHeight () {
      return function (column, index) {
        const csl = this.currentSentence.replace(/ /g, '').length
        var len = 0
        if (!this.isRowspan) {
          len = csl
        } else {
          if (index != this.info.c) {
            len = csl - this.info.i
          } else {
            len = this.info.i
          }
        }
        return len * this.fh
      }
    },
    currentSentence: function () {
      return this.$util.parseColumn(this.sentences[this.sentenceIndex])
    }
  },
  mounted () {
    this.cw = document.documentElement.clientWidth;
    this.ch = document.documentElement.clientHeight;
    this.maxRow = Math.floor((this.ch * 0.9 - 50) / this.fh)
    if (this.readMode) {
      this.maxColumn = Math.floor((this.cw - 250) / this.fw)
    } else {
      this.maxColumn = Math.floor((this.cw - 900) / this.fw)
    }
    window.onresize = () => {
      this.cw = document.documentElement.clientWidth;
      this.ch = document.documentElement.clientHeight;
      if (this.readMode) {
        this.maxColumn = Math.floor((this.cw - 250) / this.fw)
        this.maxRow = Math.floor((this.ch * 0.9 - 50) / this.fh)
        if (this.maxColumn < 8) {
          this.maxColumn = 8
        }
        if (this.maxRow < 8) {
          this.maxRow = 8
        }
      } else {
        this.maxColumn = Math.floor((this.cw - 900) / this.fw)
      }
      this.showContent()
    }
    if (this.isBook) {
      getBookContent({'book': this.id}).then(res => {
        this.title = res.title
        this.author = res.author.name.full
        res.catalog.forEach(item => {
          this.getItemContent(item)
        })
        this.contents[0] = this.srcContent
        this.showContent()
        saveBookHistory({id: this.id})
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
        if (res.desc != '') {
          this.srcContent = this.fillDesc(res.desc) + '\n' + this.srcContent
        }
        // 加入相关内容
        res.relates.forEach(item => {
          this.contents[item.type + 1] = item.content
        })
        this.contents[0] = this.srcContent
        this.sentences = this.$util.splitToSentences(this.srcContent)
        this.showContent()
        // 高亮临时
        this.info.i = this.currentSentence.replace(/ /g, '').length

        savePieceHistory({id: this.id})
      })
    }
  },
  methods: {
    fillTitle (title) {
      var n = title.length - 2
      return '┐ ' + '│ '.repeat(n) + `┘\n${title}\n┌ ` + '│ '.repeat(n) + '└'
    },
    fillDesc (desc) {
      if (desc.trim().length > 0) {
        return `◎\n${desc}\n◎`
      } else {
        return ''
      }
    },
    getItemContent(item) {
      this.srcContent += this.fillTitle(item.title) + this.fillDesc(item.desc) + '\n'
      item.pieces.forEach(piece => {
        this.srcContent += this.fillTitle(piece.title)  + this.fillDesc(piece.desc) + '\n' + piece.content + '\n'
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
      var isDesc = false                      // 是序言
      paragraphs.forEach(element => {
        if (element.trim() != '') {
          for (var i = 0; i < element.length; i += this.maxRow) {
            if (i == 0) {
              element = '＠＠' + element
            }
            var c = element.slice(i, i + this.maxRow)
            c = this.$util.parseColumn(c).replace('＠＠', '')
            const contentIndex = content.length * this.maxColumn + columnIndex
            if (c[0] == '┐') {
              this.titleColumns.push(contentIndex + 1)
            }
            if (c[0] == '◎') {
              isDesc = !isDesc
              this.viceColumns.push(contentIndex)
            }
            if (isDesc) {
              this.viceColumns.push(contentIndex)
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
    playRecord () {
      this.isPlaying = !this.isPlaying
    },
    playNext () {
      if (this.sentenceIndex < this.sentences.length - 1) {
        this.sentenceIndex ++                                           // 移至下一句
        const csl = this.currentSentence.replace(/ /g, '').length       // 当前句长度
        const currentColumn = this.pages[this.info.p][this.info.c]      // 当前列文本
        const ccl = currentColumn.replace(/ /g, '').length              // 当前列长度
        if (currentColumn.indexOf(this.currentSentence) != -1) {
          this.info.i += csl
          this.isRowspan = false
        } else {
          this.info.i = csl - (ccl - this.info.i)
          this.info.c ++
          if (this.info.c == this.maxColumn) {
            this.info.c = 0
            this.info.p ++
          }
          if (this.info.i < csl) {
            this.isRowspan = true
          } else {
            this.isRowspan = false
          }
        }
      } else {
        this.showRecordPlayer = false
      }
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
      position: relative;
      width: 100%;
      height: 100%;
      background-color: @paper-bg;
      overflow: hidden;
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
        .column-mask {
          position: absolute;
          display: flex;
          flex-direction: column;
          top: 0px;
          right: 1px;
          width: calc(100% - 2px);
          height: 100%;
          z-index: 4;
          div {
            background-color: fade(@primary-color, 30%);
          }
          .column-indicator {
            background-color: fade(@primary-color, 0%);
            // animation: flashFade 3s infinite;
            @keyframes flashFade {
              0% { background-color: fade(@primary-color, 10%); }
              50% { background-color: fade(@primary-color, 30%); }
              100% { background-color: fade(@primary-color, 10%); }
            }
          }
          .column-mask-down {
            flex: 1;
          }
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
    .piece-action {
      .piece-action-btn {
        display: block;
        margin-bottom: 16px;
      }
    }
    .page-control {
      position: absolute;
      bottom: 0px;
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
