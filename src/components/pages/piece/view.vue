<template>
  <div class="piece-page">
    <div class="piece-space">
      <Icon class="page-expand" type="ios-book-outline" size="24" color="#333" :title="$str.read + $str.mode" @click="expandPage"/>
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
          　　:class="{'column-indent': indentColumns[pageIndex].indexOf(index) != -1, 'column-vice': viceColumns.indexOf(pi * maxColumn + index) != -1}">
              {{ column }}
          </span>
        </div>
        <div class="column" v-for="n in maxColumn - page.length"><span class="v-text"></span></div>
      </div>
      <div class="piece-stamp animated fadeIn" v-show="pageIndex == pages.length - 1"><span>{{ stampText(piece.author.name.full) }}</span></div>
    </div>
    <div class="piece-title-container">
      <span class="v-title piece-title">{{ piece.title }}</span>
      <div class="piece-content-title">
        <span
          v-for="(item, index) in contents"
          :key="index"
          class="v-title content-title"
          :class="{'selected': contentIndex === index}"
          @click="changeContent(index)">{{ [$str.char[0], $str.annotate[0], $str.translate[1], $str.comment[0], $str.appreciate[0]][index] }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { getPieceRelate, addBookmark, removeBookmark, recordPieceView } from '@/api/piece'
export default {
  name: 'view-piece',
  props: {
    piece: {
      type: Object,
      required: true
    },
    readMode: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      contents: new Array(5).fill(this.$str.no_content),
      contentIndex: 0,
      maxColumn: 16,
      maxRow: 36,
      pageIndex: 0,
      pages: [],
      indentColumns: [],
      viceColumns: [],
      bookmarks: [],
      clientWidth: 600,
      showPiece: false
    }
  },
  mounted () {
    console.log(this.piece)
    this.clientWidth = document.documentElement.clientWidth;
    if (this.readMode) {
      this.maxColumn = Math.floor((this.clientWidth - 250) / 36)
    }
    window.onresize = () => {
        this.clientWidth = document.documentElement.clientWidth;
        if (this.readMode) {
          this.maxColumn = Math.floor((this.clientWidth - 250) / 36)
          if (this.maxColumn < 12) {
            this.maxColumn = 12
          }
          this.getContent()
        }
    }
    if (this.piece.hasOwnProperty('bookmarks')) {
      this.bookmarks = this.piece.bookmarks.map(item => {
        return Math.floor(item.col / this.maxColumn) + '-' + (item.col % this.maxColumn)
      })
    }
    this.getContent()
    recordPieceView({id: this.piece._id})
  },
  methods: {
    getContent () {
      // 载入原文
      // 加入题序
      var src = this.piece.content
      var hasDesc = false
      if (this.piece.desc.trim() != '') {
        src = this.piece.desc + '\r\n' + '..' + '\r\n' + src
        hasDesc = true
      }
      this.contents[0] = src
      // 加入相关内容
      this.piece.relates.forEach(item => {
        this.contents[item.type + 1] = item.content
      })
      // 处理文本
      const text = this.contents[this.contentIndex]
      var columnCount = 0
      // 段首缩进
      var paragraphs = text.split(/\n|\r\n/)
      this.indentColumns = []                 // 需缩进的行
      var indent = []                         // 每页缩进行
      var page = []                           // 页
      var content = []                        // 文
      paragraphs.forEach(element => {
        for (var i = 0; i < element.length; i += this.maxRow) {
          if (i == 0) {
            element = '＠＠' + element
          }
          var c = element.slice(i, i + this.maxRow)
          // 句读加空格在前
          c = this.$util.parseColumn(c).replace('＠＠', '')
          page.push(c)
          if (hasDesc) {
            this.viceColumns.push(columnCount)
          }
          if (c == '..') {
            hasDesc = false
          }
          columnCount++
          if (columnCount === this.maxColumn) {
            content.push(page)
            this.indentColumns.push(indent)
            indent = []
            page = []
            columnCount = 0
          }
        }
        indent.push(columnCount)
      })
      if (page.length > 0) {
        content.push(page)
        this.indentColumns.push(indent)
      }
      this.indentColumns[0].push(0)
      this.loading = false
      this.pages = content
    },
    indexBookmark: function (pi, ci) {
      return this.bookmarks.indexOf(pi + '-' + ci)
    },
    bookmark (pi, ci, column) {
      var i = this.indexBookmark(pi, ci)
      if (i > -1) {
        removeBookmark({
          id: this.piece._id,
          col: ci + pi * this.maxColumn
        })
        this.bookmarks.splice(i, 1)
      } else {
        addBookmark({
          id: this.piece._id,
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
      this.getContent()
      setTimeout(()=> {
        this.showPiece = false
      }, 1000)
    },
    expandPage () {
      this.$bus.emit('changeMode')
    },
    stampText (val) {
      if (val.length == 3) {
        val = val + '著'
      }
      if (val.length == 2) {
        val = val + '之著'
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
  @column-size: 36;
  @line-width: calc(@text-size * 2);
  @line-height: @text-size + 4px;
  @page-border-size: 4px;
  height: calc(@line-height * @column-size + calc(@base-size + @page-border-size) * 2);
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
