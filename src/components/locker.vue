<template>
  <div class="layout">
    <div v-if="loading"><span class="v-title loading-text">吾生也有涯而知也无涯</span><Spin fix /></div>
    <div v-else class="animated fadeIn">
      <div class="lock-screen" :class="{'animated shake': shakeNow}">
        <div class="titles">
          <span
            v-for="(item, index) in random.titles"
            :key="index"
            class="v-title"
            @click="unlock(item)">{{ item }}</span>
        </div>
        <div class="sentence"><span class="v-title"> ﹃ {{ random.sentence }} ﹄ </span></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    random: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      answer: '',
      shakeNow: false,
      unlocked: false,
      loading: true
    }
  },
  inject: ['reload'],
  mounted () {
    setTimeout(() => {
      this.loading = false
      this.answer = this.random.titles[this.random.index]
    }, 2000)
  },
  methods: {
    unlock (item) {
      if (item !== this.answer) {
        this.shakeNow = true
      } else {
        this.unlocked = true
        this.reload()
      }
      setTimeout(() => {
        this.shakeNow = false
      }, 1000)
    }
  }
}
</script>
<style lang="less" scoped>
.layout {
  height: 100vh;
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: center;
  justify-content: center;
  align-items: center;
  .loading-text {
    display: block;
    position: relative;
    left: 32px;
    bottom: 100px;
    height: 300px;
    line-height: @title-height * 1.2;
    font-size: @title-size * 1.2;
    z-index: 99;
    color: @primary-color;
    animation: showChar 3s 1;
    @keyframes showChar {
      from {height: 300px;opacity: 1;}
      to {height: 0px;opacity: 0;}
    }
    @-webkit-keyframes showChar {
      from {height: 300px;opacity: 1;}
      to {height: 0px;opacity: 0;}
    }
  }
  .lock-screen {
    width: 400px;
    height: auto;
    overflow: hidden;
    background-color: @card-bg;
    border: 12px @primary-color solid;
    padding: 0px 24px;
    color: @primary-color;
    display: flex;
    align-items: flex-end;
    .sentence {
      span {
        font-size: @title-size * 1.5;
        line-height: @title-height * 1.2;
        font-weight: bold;
      }
    }
    .titles {
      margin-right: 48px;
      span {
        display: inline-block;
        @pad: 4px;
        width: @title-size + @pad * 4;
        padding: @pad;
        font-size: @title-size;
        line-height: @subtitle-height;
        margin: @title-height 12px;
        background-color: @primary-color;
        border: @pad @primary-color double;
        color: white;
        cursor: pointer;
        transition: all 1s;
        -webkit-transition: all 1s;
        &:hover {
          background-color: white;
          color: @primary-color;
        }
      }
    }
  }
}
</style>
