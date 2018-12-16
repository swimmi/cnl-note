<template>
  <div class="list-view">
    <div class="list-header">
      <div class="list-title">{{ list.title }}</div>
    </div>
    <Scroll class="list-scroll" height="100%">
      <section v-if="list.type == 'piece'">
        <piece-item
        v-for="(item, index) in list.data"
        :key="index"
        :piece="item"
        class="animated bounceInLeft"></piece-item>
      </section>
      <section v-else-if="list.type == 'book'">
        <book-item
        v-for="(item, index) in list.data"
        :key="index"
        :book="item"
        class="animated bounceInLeft"></book-item>
      </section>
    </Scroll>
  </div>
</template>
<script>
import PieceItem from '@/components/widgets/item/piece'
import BookItem from '@/components/widgets/item/book'
export default {
  name: 'list-view',
  components: {
    PieceItem,
    BookItem
  },
  props: {
    list: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
    }
  },
  mounted () {
  }
}
</script>
<style lang="less" scoped>
.list-view {
  height: 100vh;
  position: relative;
  background: @card-bg;
  overflow-y: auto;
  overflow-x: hidden;
  .list-header {
    height: 48px;
    width: 90%;
    margin: 0px auto;
    text-align: center;
    border-bottom: 1px @white-bg solid;
    .list-title {
      line-height: 48px;
      color: @text-vice;
      font-size: @subtitle-size;
      letter-spacing: 4px;
    }
  }
  .list-scroll {
    width: calc(100% + 36px);
    height: calc(100vh - 48px);
    overflow-y: auto;
  }
}
</style>
