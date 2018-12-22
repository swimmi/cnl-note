<template>
  <div v-if="loading" />
  <div v-else class="piece-page" ref="page">
    <div class="piece-title-container">
      <span class="v-title piece-title">
        <marquee class="piece-title-long" v-if="title.length >= 12" scrollamount="15" direction="up">{{ title }}</marquee>
        <span v-else>{{ title }}</span>
      </span>
      <span class="v-title piece-author">{{ author }}</span>
      <div v-if="contentIndex == 0" class="piece-action piece-action-right">
        <Icon
          class="icon-btn piece-action-btn"
          type="ios-color-wand"
          size="20"
          :color="markable? 'red' : '#888'"
          :title="$str.mark + $str.piece"
          @click="startMark"/>
        <Icon
          class="icon-btn piece-action-btn"
          type="ios-mic"
          size="20"
          :color="showRecordPlayer? 'red' : '#888'"
          :title="(showRecordPlayer? $str.stop : $str.start) + $str.record"
          v-show="!isBook && recordList.length > 0"
          @click="startRecord"/>
        <transition enter-active-class="fadeIn" leave-active-class="fadeOut" mode="out-in">
          <Icon
            class="icon-btn piece-action-btn animated"
            :type="isPlaying ? 'ios-pause' : 'ios-play'"
            size="20"
            color="red"
            :title="(isPlaying ? $str.pause : $str.resume) + $str.record"
            v-show="showRecordPlayer"
            @click="playRecord"/>
        </transition>
      </div>
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
    <div class="piece-content animated" :class="{'fadeIn': showPiece}">
      <Slider show-stops v-show="pages.length > 1 && showPages" class="piece-page-control" :max="pages.length - 1" v-model="pageIndex"></Slider>
      <div class="page animated fadeIn" v-show="pageIndex == pi" v-for="(page, pi) in pages" :key="pi">
        <div
          class="column"
          v-for="(column, index) in page"
          @mousedown.capture="markIn(pi, index, $event)"
          @mousemove.capture="markMove(pi, index, $event)"
          @mouseup.capture="markOut"
          @mouseleave.capture="markOut">
          <span class="column-text bookmark-space" :class="{'bookmark': indexBookmark(pi, index) > -1}" @click="bookmark(pi, index, column)" :title="$str.add + $str.bookmark"></span>
          <span
            class="column-text v-text"
            :class="{'column-indent': isIndent(index), 'column-vice': isVice(pi, index), 'column-title': isTitle(pi, index), 'mark-cursor': markable}">
            {{ column }}
            <div v-if="contentIndex == 0">
              <div
                  class="piece-mark"
                  :style="{'top': `${item.start * fh + 2}px`, 'height': `${item.text.length * fh - 4}px`}"
                  v-for="(item, mi) in getColumnMarks(pi, index)"
                  :key="mi">
                <span
                  class="v-title mark-desc"
                  v-show="item.show">
                  <Icon color="white" type="ios-eye" />
                  {{ item.desc }}
                  <Icon color="white" type="ios-close" />
                </span>
                <span
                  class="mark-line">
                </span>
              </div>
            </div>
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
          <span class="column-text v-text">
            <transition enter-active-class="flipInY" leave-active-class="flipOutY">
              <div class="column-mask animated" v-show="showRecordPlayer"><div class="column-mask-down"></div></div>
            </transition>
          </span>
        </div>
      </div>
      <div class="piece-stamp-container"
        v-show="pageIndex == pages.length - 1">
        <div
          class="piece-stamp piece-author-stamp animated pulse"
          :title="$str.author + '：' + author">
          <span>{{ stampText(author) }}</span>
        </div>
        <div v-if="!isBook" class="piece-stamps">
          <div
            class="piece-stamp piece-understand-stamp"
            :class="{'stamp-off': !piece.status.understand, 'animated pulse': piece.status.understand}"
            :title="$str.understand + $str.all_content"
            @click="understandPiece">
            <span>{{ $str.understand + $str.all_content }}</span>
          </div>
          <div
            v-show="piece.status.understand"
            class="piece-stamp piece-recite-stamp"
            :class="{'stamp-off': !piece.status.recite, 'animated pulse': piece.status.recite}"
            :title="$str.recite + $str.all_content"
            @click="recitePiece">
            <span>{{ stampText($str.recite + $str.all_content) }}</span>
          </div>
          <div
            v-show="piece.status.recite"
            class="piece-stamp piece-favorite-stamp"
            :class="{'stamp-off': !piece.status.favorite, 'animated pulse': piece.status.favorite}"
            :title="$str.favorite"
            @click="favoritePiece">
            <span>{{ $str.favorite }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="piece-space">
      <div class="piece-action piece-action-left">
        <Icon
          class="icon-btn piece-action-btn"
          :type="isReadMode?'ios-paper':'ios-book'"
          size="20"
          color="#888"
          :title="(isReadMode?$str.browse:$str.read) + $str.mode"
          @click="changeMode"/>
        <Icon
          class="icon-btn piece-action-btn"
          type="ios-paper-plane"
          size="20"
          color="#888"
          :title="$str.random + $str.piece"
          @click="randomView"/>
      </div>
      <div class="page-control">
        <Icon
          class="icon-btn"
          :class="{'icon-btn-disabled': pageIndex == 0}"
          type="ios-arrow-up"
          size="20"
          @click="pageIndex > 0 ? pageIndex-- : ''" />
        <span class="label-text page-number current-number" @click="showPages = !showPages">第{{ $util.parseNumber(pageIndex + 1) }}页</span>
        <Icon
          class="icon-btn"
          :class="{'icon-btn-disabled': pageIndex == pages.length - 1}"
          type="ios-arrow-down"
          size="20"
          @click="pageIndex < pages.length - 1 ? pageIndex++ : ''" />
      </div>
    </div>
  </div>
</template>
<script>
import { getPiece, getPieceRelate, addPieceMark, updatePieceStatus } from '@/api/piece'
import { getBookContent, addBookmark, removeBookmark } from '@/api/book'
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
      required: true
    }
  },
  data () {
    return {
      piece: null,
      book: null,
      srcContent: '',
      contents: new Array(5).fill(this.$str.no_content),
      contentIndex: 0,
      maxColumn: 8,
      maxRow: 8,
      pageIndex: 0,
      pages: [],
      showPages: false,
      bookmarks: [],
      indentColumns: [],
      viceColumns: [],
      titleColumns: [],
      fh: 22,               // 字高
      fw: 36,               // 字宽
      cw: 0,                // 窗口宽度
      ch: 0,                // 窗口高度
      showPiece: false,
      isReadMode: this.readMode,

      sentences: [],        // 句子
      sentenceIndex: -1,    // 句子索引
      showRecordPlayer: false,
      isPlaying: true,
      recordList: [],
      info: {               // 当前高亮处
        p: 0,               // 页码
        c: 0,               // 列数
        i: 0                // 高亮尾端位置，去除占位空格
      },
      isRowspan: false,     // 是否跨列
      markList: [],         // 标注
      columnMarks: [],      // 标注列表
      markable: false,      // 可标注
      markStarted: false,   // 标注开始
      columnText: '',       // 选中列文本
      markPageIndex: -1,    // 当前标注页
      markColumnIndex: -1,  // 当前标注列
      startMarkIndex: 0,
      endMarkIndex: 0,
      newMark: {            // 新增标注
        text: '',
        index: 0,
        desc: ''
      },
      loading: true
    }
  },
  computed: {
    title () {
      return this.isBook ? this.book.title : this.piece.title
    },
    author () {
      return this.isBook ? this.book.author.name.full : this.piece.author.name.full
    },
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
    upHeight () {   // 朗读指示器距上高度
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
        return len * this.fh - 1
      }
    },
    indicatorHeight () {  // 朗读指示器高度
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
        return len * this.fh + 2
      }
    },
    currentSentence: function () {
      if (this.isBook) {
        return ''
      } else {
        if (this.sentenceIndex >= 0 && this.sentenceIndex < this.sentences.length) {
          return this.$util.parseColumn(this.sentences[this.sentenceIndex])
        } else {
          return ''
        }
      }
    }
  },
  mounted () {
    this.$bus.on('resetRecord', this.resetRecord)
    this.$bus.on('playNextRecord', this.playNextRecord)
    this.$bus.on('recitePieceDone', this.recitePieceDone)
    window.onresize = () => {
      this.reloadPage(false)
    }
    if (this.isBook) {
      getBookContent({'book': this.id}).then(res => {
        this.book = res
        this.book.catalog.forEach(item => {
          this.getItemContent(item)
        })
        this.contents[0] = this.srcContent
        if (this.book.hasOwnProperty('bookmarks')) {
          this.bookmarks = this.book.bookmarks.map(item => {
            return Math.floor(item.col / this.maxColumn) + '-' + (item.col % this.maxColumn)
          })
        }
        this.reloadPage(true)
      })
    } else {
      getPiece({'id': this.id}).then(res => {
        this.piece = res
        this.srcContent = this.piece.content
        this.sentences = this.$util.splitToSentences(this.srcContent)
        // 加入题序
        if (this.piece.desc != '') {
          this.sentences = this.$util.splitToSentences(this.piece.desc + this.srcContent)
          this.srcContent = this.fillDesc(this.piece.desc) + '\n' + this.srcContent
        }
        // 加入相关内容
        if (this.piece.relates) {
          this.piece.relates.forEach(item => {
            this.contents[item.type + 1] = item.content
          })
        }
        // 加入标注内容
        if (this.piece.marks) {
          this.markList = this.piece.marks
        }
        this.contents[0] = this.srcContent
        this.reloadPage(true)
        this.loadMarks()
        if (this.piece.records) {
          this.recordList = this.piece.records
        }
      })
    }
  },
  methods: {
    fillTitle (title) {
      return `※\n${title}\n◇`
    },
    fillPieceTitle (piece) {
      var a = `\n${piece.author.name.full}`
      if (piece.author.name.full == this.author) {
        a = ''
      }
      return `※\n${piece.title}${a}\n◇`
    },
    fillDesc (desc) {
      if (desc.trim().length > 0) {
        return `\n◎\n${desc}\n◎`
      } else {
        return '\n'
      }
    },
    getItemContent(item) {
      this.srcContent += this.fillTitle(item.title) + this.fillDesc(item.desc) + '\n'
      item.pieces.forEach(piece => {
        this.srcContent += this.fillPieceTitle(piece) + this.fillDesc(piece.desc) + '\n' + piece.content + '\n'
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
            if (c.trim() == '※') {
              this.titleColumns.push(contentIndex + 1)
            }
            if (c.trim() == '◎') {
              isDesc = !isDesc
            }
            if (isDesc) {
              this.viceColumns.push(contentIndex)
            }
            if (['※', '◇'].indexOf(c.trim()) != -1) {
              c= ''
            }
            if (c != '◎') {
              page.push(c)
              columnIndex++
            }
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
    reloadPage (flag) {
      this.cw = document.documentElement.clientWidth;
      this.ch = document.documentElement.clientHeight;
      var offset = 160 + 48 * 2
      if (!this.isReadMode) {
        offset += 1000
      }
      const mc = Math.max(Math.floor((this.cw - offset) / this.fw), 3)
      this.maxRow = Math.max(Math.floor((this.ch * 0.9 - 50) / this.fh), 8)
      if (flag) {
        const i = 30
        var timeout = 100
        if (!this.isReadMode) {
          timeout += (this.maxColumn - mc) * i
        }
        setTimeout(() => {
          this.$bus.emit('setReadMode', this.isReadMode)
        }, timeout)
        var interval = setInterval(() => {
          if (mc != this.maxColumn) {
            this.maxColumn += (mc > this.maxColumn ? 1 : -1)
          } else {
            this.showContent()
            clearInterval(interval)
          }
        }, i)
      } else {
        this.maxColumn = mc
      }
      this.pageIndex = 0          // 防止拉伸变化后pageIndex溢出
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
    changeMode () {
      this.isReadMode = !this.isReadMode
      this.reloadPage(true)
    },
    startRecord () {
      if (this.recordList.length > 0) {
        if (!this.showRecordPlayer) {
          this.$bus.emit('setAudioList', this.recordList, this.id)
          this.isPlaying = true
          this.showRecordPlayer = true
        } else {
          this.$bus.emit('stopAudio')
          this.resetRecord()
        }
      }
    },
    playRecord () {
      this.isPlaying = !this.isPlaying
      this.$bus.emit('controlAudio')
    },
    playNextRecord () {
      if (this.sentenceIndex < this.recordList.length - 1) {
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
        this.isPlaying = true
      } else {
        this.resetRecord()
      }
    },
    resetRecord () {
      this.sentenceIndex = -1
      this.info = {
        p: 0,
        c: 0,
        i: 0
      }
      this.isPlaying = false
      this.showRecordPlayer = false
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
    },
    understandPiece () {
      if (!this.piece.status.understand) {
        // 要求撰写翻译方为理解
        if(this.contents[2].trim() == this.$str.no_content) {
          this.$Message.warning(this.$str.understand_tip);
          this.$bus.emit('addPieceRelate', 1, this.id)
        } else {
          updatePieceStatus({'id': this.id, 'type': 0, 'value': true}).then(() => {
            this.piece.status.understand = true
            this.$Message.success(this.$str.mark + this.$str.success);
          })
        }
      }
    },
    recitePiece () {
      if (!this.piece.status.recite) {
        this.$bus.emit('switchPowerMode', 1, {'id': this.id})
        this.$Message.warning(this.$str.recite_tip);
      }
    },
    recitePieceDone () {
      if (!this.piece.status.recite) {
        updatePieceStatus({'id': this.id, 'type': 1, 'value': true}).then(() => {
          this.piece.status.recite = true
        })
      }
    },
    favoritePiece () {
      if (!this.piece.status.favorite) {
        // 要求朗诵全文方可收藏
        if (this.piece.records.length < this.$util.splitToSentences(this.piece.content).length) {
          this.$Message.warning(this.$str.favorite_tip);
          this.$bus.emit('actionPiece', 'record', this.id)
        } else {
          updatePieceStatus({'id': this.id, 'type': 2, 'value': true}).then(() => {
            this.piece.status.favorite = true
            this.$Message.success(this.$str.favorite + this.$str.success);
          })
        }
      }
    },
    loadMarks () {
      for (var p = 0; p < this.pages.length; p++) {
        const page = this.pages[p]
        for (var c = 0; c < page.length; c++) {
          const column = page[c]
          for (var i = 0; i < this.markList.length; i++) {
            var item = this.markList[i]
            var start = column.replace(/ /g, '').indexOf(item.text)
            if (start != -1) {
              item.index -=1
            }
            if (item.index < 0) {
              item.start = start + 1
              this.columnMarks.push({
                p: p,
                c: c,
                mark: item
              })
              this.markList.splice(i, 1)
              i--
            }
          }
        }
      }
    },
    getColumnMarks (pi, index) {
      var marks = []
      this.columnMarks.forEach(item => {
        if (item.p == pi && item.c == index) {
          item.mark.show = false
          marks.push(item.mark)
        }
      })
      if (pi == this.markPageIndex && index == this.markColumnIndex && this.newMark.text.length > 0) {
        marks.push(this.newMark)
      }
      return marks
    },
    getRangeText (text, start, end) {
      if (start > end) {
        start = [end, end = start][0]
      }
      if (start == end) {
        end ++
      }
      return text.substring(start, end)
    },
    addPieceMark () {
      const text = this.getRangeText(this.columnText, this.startMarkIndex, this.endMarkIndex)
      // 获取当前列之前文本中包含标注词数量
      var allText = ''
      for (var p = 0; p <= this.markPageIndex; p ++) {
        for (var c= 0; c < this.markColumnIndex; c ++) {
          allText += this.pages[p][c].trim()
        }
      }
      var count = this.$util.countMatch(text, allText.replace(/ /g, ''))
      this.newMark.index = count
      // 获取当前列之中文本标注词数量
      const startIndex = Math.min(this.startMarkIndex, this.endMarkIndex)
      allText = this.columnText.substring(0, startIndex)
      count = this.$util.countMatch(text, allText)
      this.newMark.index += count
      if (text.trim() != '') {
        addPieceMark({'id': this.id, 'mark': this.newMark}).then(res => {
          this.markList.push(this.newMark)
          this.loadMarks()
          this.newMark = {
            text: '',
            index: 0,
            desc: ''
          }
        })
      }
    },
    startMark () {
      if (this.showRecordPlayer) {
        this.$Message.warning(this.$str.stop_play_record_tip)
      } else {
        this.markable = !this.markable
      }
    },
    markIn (pi, index, event) {
      if (this.markable) {
        this.markPageIndex = pi
        this.markColumnIndex = index
        this.columnText = this.pages[pi][index].replace(/ /g, '').trim()
        const y = event.offsetY
        this.startMarkIndex = Math.floor(y / this.fh) - 1
        this.markStarted = true
      }
    },
    markMove (pi, index, event) {
      if (this.markStarted) {
        const y = event.offsetY
        var moveIndex = Math.floor(y / this.fh)
        const text = this.getRangeText(this.columnText, this.startMarkIndex, moveIndex)
        if (text != this.newMark.text) {
          this.newMark.text = text
          this.newMark.start = moveIndex > this.startMarkIndex? this.startMarkIndex + 1 : moveIndex + 1
        }
      }
    },
    markOut (event) {
      if (this.markable && this.markStarted) {
        const y = event.offsetY
        this.endMarkIndex = Math.floor(y / this.fh)
        this.markStarted = false
        this.inputMarkDesc()
      }
    },
    inputMarkDesc () {
      this.$Modal.confirm({
        render: (h) => {
          return h('Input', {
            props: {
              type: 'textarea',
              rows: 3,
              value: this.newMark.desc,
              autofocus: true,
              placeholder: this.$str.mark_desc_tip
            },
            on: {
              input: (val) => {
                this.newMark.desc = val
              }
            }
          })
        },
        onOk: () => {
          this.addPieceMark()
        },
        onCancel: () => {
          this.newMark = {
            text: '',
            index: 0,
            desc: ''
          }
        }
      })
    },
    randomView () {
      if(this.showRecordPlayer) {
        this.$Message.warning(this.$str.stop_play_record_tip)
      } else {
        this.$bus.emit('randomPiece')
      }
    }
  }
}
</script>
<style lang="less" scoped>
.piece-page {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 48px;
  flex-direction: row-reverse;
  @base-size: 24px;
  @text-size: 18px;
  @line-width: calc(@text-size * 2);
  @line-height: @text-size + 4px;
  @page-border-size: 4px;
  .piece-content {
    position: relative;
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
      display: flex;
      flex-direction: row-reverse;
      height: 100%;
      background-color: @paper-bg;
      .column-indent {
        position: relative;
        top: @line-height * 2;
      }
      .column {
        flex: 1;
        position: relative;
        height: 100%;
        text-align: center;
        border-left: 1px @primary-color solid;
        color: @text-black;
        .column-text {
          width: @line-width;
          padding: @base-size 8px;
        }
        .decoration {
          .center-horizontal();
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
        }
        .bookmark-hide {
          animation: slide-up .2s ease-out 0s 1;
          @keyframes slide-up
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
            animation: flashFade 1s infinite;
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
        .piece-mark {
          position: absolute;
          cursor: pointer;
          span {
            display: inline-block;
          }
          .mark-line {
            position: absolute;
            width: 2px;
            height: 100%;
            top: 0px;
            left: -2px;
            background-color: @stamp-color;
            z-index: 3;
            i {
              position: absolute;
              left: -16px;
            }
          }
          .mark-desc {
            position: absolute;
            text-align: center;
            left: -24px;
            padding: 8px 0px;
            width: auto;
            color: white;
            font-size: @subtext-size;
            border-radius: @base-radius;
            background-color: fade(@mask-bg, 50%);
            cursor: pointer;
          }
        }
      }
      .mark-cursor {
        cursor: url('~@/assets/mark_cursor.png'), url('~@/assets/mark_cursor.png'), auto;
      }
    }
    .piece-author-stamp {
      position: absolute;
      width: 64px;
      height: 64px;
      bottom: 22px;
      left: 22px;
      background-image: url('~st/images/author_stamp.png');
      span {
        .flash-text();
        color: white!important;
      }
    }
    .piece-understand-stamp {
      position: absolute;
      width: 48px;
      height: 120px;
      bottom: 120px;
      left: 30px;
      background-image: url('~st/images/understand_stamp.png');
    }
    .piece-recite-stamp {
      position: absolute;
      width: 64px;
      height: 100px;
      bottom: 260px;
      left: 22px;
      background-image: url('~st/images/recite_stamp.png');
      span {
        margin-top: 4px;
      }
    }
    .piece-favorite-stamp {
      position: absolute;
      width: 50px;
      height: 90px;
      bottom: 380px;
      left: 28px;
      background-image: url('~st/images/favorite_stamp.png');
      span {
        color: white!important;
        font-size: 28px!important;
        margin-top: 8px;
        margin-left: 8px;
      }
    }
    .piece-stamp {
      font-family: 'Zhuanti';
      background-size: cover;
      span {
        .flex-center();
        text-align: center;
        padding: 4px;
        width: 100%;
        height: 100%;
        font-size: 24px;
        line-height: @title-height - 4px;
        color: @stamp-color;
        .hover-fade();
        cursor: pointer;
      }
    }
    .stamp-off {
      filter: grayscale(100%);
      opacity: .5;
      .hover-fade();
    }
    .piece-page-control {
      position: absolute;
      width: 100%;
      left: 0px;
      bottom: -20px;
      z-index: 3;
    }
  }
  .piece-title-container {
    position: relative;
    height: 100%;
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    @title-padding: 16px;
    .v-title {
      width: @v-title-width + @title-padding * 1.5;
      text-align: center;
      line-height: calc(@text-size * 1.8);
      cursor: pointer;
    }
    .piece-title {
      background-color: @paper-bg;
      border: 4px @primary-color double;
      font-size: calc(@text-size * 1.2);
      max-height: 40vh;
      overflow: hidden;
      margin-bottom: 8px;
      padding: 8px 0px;
      color: @text-black;
      &:hover {
        background: @card-bg;
      }
    }
    .piece-title-long {
      height: 60vh;
      text-align: center;
    }
    .piece-author {
      .piece-title();
      border: 2px @primary-color solid;
      padding: 2px;
      background-color: @card-bg;
      font-size: @text-size;
      line-height: calc(@text-size * 1.5);
      margin-bottom: 32px;
      .hover-fade();
    }
    .piece-content-title {
      position: absolute;
      bottom: 0px;
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
    vertical-align: top;
    height: 100%;
    .page-control {
      position: absolute;
      bottom: 0px;
      .page-number {
        text-align: center;
        font-size: @font-middle;
        font-weight: bold;
      }
      .page-numbers {
        position: absolute;
        width: 200px;
        bottom: 48px;
        left: 48px;
        overflow-y: auto;
        z-index: 3;
      }
      .current-number {
        display: block;
        .margin-v(12px)
      }
    }
  }
  .piece-action {
    .piece-action-btn {
      display: block;
      position: relative;
      margin-bottom: 16px;
    }
  }
}
</style>
