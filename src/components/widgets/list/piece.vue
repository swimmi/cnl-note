<template>
  <div class="search-result">
    <Scroll class="result-scroll" :height="scrollHeight">
      <Divider>{{ list.title }}</Divider>
      <piece-item
        v-for="(item, index) in list.data"
        :key="index"
        :piece="item"
        class="animated bounceInLeft"></piece-item>
    </Scroll>
  </div>
</template>
<script>
import PieceItem from '@/components/widgets/item/piece'
export default {
  name: 'piece-list',
  components: {
    PieceItem
  },
  props: {
    list: {
      type: Object,
      require: true
    }
  },
  data () {
    return {
      scrollHeight: 800,
      loading: false
    }
  },
  mounted () {
    this.scrollHeight = document.documentElement.clientHeight;
  }
}
</script>
<style lang="less" scoped>
.search-result {
  position: relative;
  background: @card-bg;
  overflow-y: auto;
  overflow-x: hidden;
  left: -16px;
  .result-scroll {
    width: calc(100% + 32px);
    overflow-y: auto;
  }
}
</style>
