<template>
  <div class="dashboard">
    <Spin v-if="loading" class="center-parent"></Spin>
    <Carousel v-else autoplay v-model="index" arrow="never" class="data-carousel">
      <CarouselItem v-for="(item, index) in counts" :key="index">
        <Card class="data-panel" @click="loadData">
          <p class="text-top">{{ topStrs[index] }}</p>
          <p class="text-count">{{ item }}</p>
          <p class="text-bottom">{{ bottomStrs[index] }}</p>
        </Card>
      </CarouselItem>
    </Carousel>
  </div>
</template>
<script>
import { dashboard } from '@/api/common'
export default {
  data() {
    return {
      index: 0,
      counts: [],
      errored: false,
      topStrs: ['-', '-', '-', '-' , this.$str.read],
      bottomStrs: [this.$str.author, this.$str.piece, this.$str.book, this.$str.char, this.$str.duration_unit],
      loading: true
    }
  },
  mounted () {
    setInterval(() => {
      this.loadData()
    }, 1000)
  },
  methods: {
    loadData () {
      dashboard().then(res => {
        this.counts = res
        this.loading = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.dashboard {
  width: 150px;
  height: 150px;
  .data-carousel {
    position: relative;
    .data-panel {
      background: @card-bg;
      border: none;
      p {
        color: @iview-color;
        width: 100%;
        text-align: center;
      }
      .text-top {
        font-size: 14px;
        margin-top: 16px;
      }
      .text-count {
        font-size: 32px;
        font-weight: bold;
      }
      .text-bottom {
        font-size: 20px;
      }
    }
  }
}
</style>
