<template>
  <div id="app" :style="{backgroundImage: 'url(static/images/bg/'+ theme + '.jpg)'}">
    <router-view v-if="isRouterAlive" class="animated fadeIn" :piece="random.piece"/>
    <router-view v-else name="locker" :random="random"/>
    <Icon
      class="change-btn"
      type="ios-sync"
      size="16"
      :title="$str.change + $str.background"
      @click="changeBg" />
  </div>
</template>
<script>
import { getPieceRandom } from '@/api/piece'
export default {
  name: 'App',
  provide () {
    return {
      reload: this.reload
    }
  },
  data () {
    return {
      theme: 1,
      random: {
        piece: null,
        sentence: '',
        titles: [],
        index: 0
      },
      isRouterAlive: false
    }
  },
  mounted () {
    getPieceRandom({size: 4}).then(res => {
      if (res) {
        res.forEach(item => {
          this.random.titles.push(item.title)
        })
        this.random.index = Math.floor(Math.random() * 4)
        this.random.piece = res[this.random.index]
        this.randomSentence()
      }
    })
  },
  methods: {
    randomSentence () {
      var text = '。' + this.random.piece.content.replace(/<br\/>/g, '')
      var temp = text.replace(/！|？/g, '。')
      var i = Math.ceil(Math.random() * (temp.length - 1))
      console.log(i, temp[i])
      if (temp[i] == '。') {
        i --
      }
      var start = temp.lastIndexOf('。', i)
      if (start == -1) {
        start = 0
      }
      var end = temp.indexOf('。', i)
      if (end == -1) {
        end = text.length - 1
      }
      this.random.sentence = this.$util.parseColumn(text.substring(start + 1, end + 1).trim())
    },
    changeBg () {
      this.theme = Math.ceil(Math.random() * 20)
    },
    reload () {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style lang="less">
@primary-color: #248631c9;
#app {
  font-family: 'MyFont';
  -webkit-user-select: none;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: auto 200vh;
  background-position: 0px 0%;
  animation: bgFloat 120s linear infinite;
  @keyframes bgFloat {
    0% {background-position: 0% 0%}
    25% {background-position: 100% 0%}
    50% {background-position: 100% 100%}
    75% {background-position: 0% 100%}
    100% {background-position: 0% 0%}
  }
  .change-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 8px;
    cursor: pointer;
    transition: all 1s;
    &:hover {
      background: @card-bg;
    }
  }
  .icon-btn {
    background: @paper-bg;
    border: 4px @primary-color double;
    padding: 4px;
    cursor: pointer;
    &:hover {
      background: @card-bg;
    }
  }
}
</style>
