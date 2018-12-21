<template>
  <div class="list-view">
    <div class="list-header">
      <div class="list-title" @click="scrollToTop"><span>{{ data.title }}</span></div>
      <div class="list-tabs">
        <span class="title-piece" :class="{'title-on': item == 0}" @click="item = 0">{{ $str.piece + counts[0] }}</span>
        <span class="title-book" :class="{'title-on': item == 1}" @click="item = 1">{{ $str.book + counts[1] }}</span>
        <span class="list-tabs-indicator" :class="selectedTab"></span>
      </div>
    </div>
    <Scroll ref="scroll" :on-reach-edge="handleData" :distance-to-edge="10" class="list-scroll" :height="scrollHeight">
      <section v-if="item == 0">
        <piece-item
        v-for="(item, index) in pieces"
        :key="index"
        :piece="item"
        class="animated zoomInLeft"></piece-item>
      </section>
      <section v-if="item == 1">
        <book-item
        v-for="(item, index) in books"
        :key="index"
        :book="item"
        class="animated zoomInLeft"></book-item>
      </section>
    </Scroll>
  </div>
</template>
<script>
import PieceItem from '@/components/widgets/item/piece'
import BookItem from '@/components/widgets/item/book'
import { getRecentPieces, getAuthorPieces, getCategoryPieces } from '@/api/piece'
import { getRecentBooks, getAuthorBooks, getCategoryBooks } from '@/api/book'
import { getItemCount } from '@/api/common'
export default {
  name: 'list-view',
  components: {
    PieceItem,
    BookItem
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      item: 0,          // 0: piece, 1: book
      pieces: [],
      books: [],
      counts: [0, 0],       // 数量
      pages: [0, 0],
      limit: 10,
      scrollHeight: 0,
    }
  },
  computed: {
    selectedTab: function () {
      return this.item == 0 ? 'select-first': 'select-second'
    }
  },
  mounted () {
    this.scrollHeight = document.documentElement.clientHeight - 87
    this.loadData(0)
    this.loadData(1)
  },
  methods: {
    scrollToTop () {
      this.$refs.scroll.scrollTop = this.$refs.scroll.scrollHeight
    },
    fetch (val, methods, params) {
      methods[val](params).then(res => {
        res.forEach(item => {
          if (val == 0) {
            this.pieces.push(item)
          } else {
            this.books.push(item)
          }
        })
        getItemCount({'params': params}).then(res => {
          this.counts = res
        })
      })
    },
    loadData (val) {
      var params = this.data.params || null
      params.page = this.pages[val]
      params.limit = this.limit
      const type = this.data.type
      switch (type) {
        case 'recent-items':
          this.fetch(val, [getRecentPieces, getRecentBooks], params)
          break
        case 'author-items':
          this.fetch(val, [getAuthorPieces, getAuthorBooks], params)
          break
        case 'category-items':
          this.fetch(val, [getCategoryPieces, getCategoryBooks], params)
          break
      }
    },
    handleData (dir) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (dir > 0) {
            this.pages[this.item] = 0
            if (this.item == 0) {
              this.pieces = []
            }
            if (this.item == 1) {
              this.books = []
            }
            this.loadData(this.item)
            resolve()
          } else {
            this.pages[this.item] ++
            this.loadData(this.item)
            resolve()
          }
        }, 1000)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.list-view {
  height: 100vh;
  position: relative;
  overflow: hidden;
  .list-header {
    margin: 0px auto;
    text-align: center;
    border-bottom: 1px @white-bg solid;
    .list-title {
      line-height: @list-header-height;
      font-size: @title-size;
      background: @card-bg;
    }
    .list-tabs {
      position: relative;
      display: flex;
      line-height: 38px;
      color: @text-vice;
      font-size: @subtitle-size;
      letter-spacing: 4px;
      span {
        flex: 1;
        cursor: pointer;
        background: @card-bg;
      }
      .title-on {
        color: @primary-color;
      }
      .title-author {
        color: @text-black;
        background: transparent;
      }
      .title-book, .title-piece {
        transition: all 1s;
      }
      .list-tabs-indicator {
        position: absolute;
        bottom: 0px;
        display: block;
        width: 60px;
        height: 2px;
        background-color: @primary-color;
        transition: all .5s ease-in-out;
      }
      .select-first {
        transform: translateX(56px);
      }
      .select-second {
        transform: translateX(238px);
      }
    }
  }
  .list-scroll {
    width: calc(100% + @scrollbar-width);
    background: @card-bg;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
