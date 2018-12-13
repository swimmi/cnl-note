<template>
  <section v-if="errored"></section>
  <section v-else>
    <Spin v-if="loading" class="center-parent"></Spin>
    <Carousel v-else autoplay v-model="index" arrow="never" class="data-carousel">
      <CarouselItem v-for="(item, index) in counts" :key="index">
        <Card class="data-panel"><p class="data-type">-</p><p class="data-count">{{ item }}</p><p class="data-type">{{ [$str.author, $str.piece, $str.char][index] }}</p></Card>
      </CarouselItem>
    </Carousel>
  </section>
</template>
<script>
import { dashboard } from '@/api/common'
export default {
  data() {
    return {
      index: 0,
      counts: [],
      errored: false,
      loading: true
    }
  },
  mounted () {
    setTimeout(() => {
      dashboard().then(res => {
        this.counts = res
        this.loading = false
      })
    }, 1000)
  }
}
</script>
<style lang="less" scoped>
.data-carousel {
  position: relative;
  .data-panel {
    width: 150px;
    height: 150px;
    margin: 0 auto;
    background: @card-bg;
    border: none;
    cursor: pointer;
    p {
      color: @primary-color;
      width: 100%;
      text-align: center;
    }
    .data-count {
      font-size: 32px;
      font-weight: bold;
    }
    .data-type {
      font-size: 16px;
    }
  }
}
</style>
