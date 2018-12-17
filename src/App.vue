<template>
  <div id="app" :style="{backgroundImage: 'url(static/images/bg/'+ theme + '.jpg)'}">
    <router-view v-if="isRouterAlive" :piece="random.piece"/>
    <router-view v-else name="locker" :random="random"/>
    <Icon
      class="change-btn"
      type="ios-sync"
      size="16"
      :title="$str.change + $str.background"
      @click="changeBg" />
    <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
      <div class="power-mask animated" v-show="isPowerMode">
        <textarea
          ref="powerInput"
          @keyup.enter="powerSend"
          autofocus
          class="power-input animated"
          :class="{'shake': textPaired == -1, 'bounce': textPaired == 1}"
          v-model="powerText"
          :placeholder="$str.power_tip"></textarea>
        <div class="pair-text-container">
          <transition-group>
            <span class="v-power-text pair-text" v-for="(item, index) in showPairTexts" :key="item + index">{{ item }}</span>
          </transition-group>
        </div>
      </div>
    </transition>
      <Icon
      class="power-btn animated"
      :type="isPowerMode ? 'ios-moon' : 'ios-sunny'"
      size="24"
      color="#fff"
      @click="switchPowerMode" />
  </div>
</template>
<script>
import { getPieceRandom } from '@/api/piece'
import { pairText } from '@/api/common'
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
      isRouterAlive: false,
      isPowerMode: false,
      textPaired: 0,       // 匹配到上下句
      powerText: '',
      pairTexts: [],
      maxSize: 16
    }
  },
  computed: {
    showPairTexts: function () {
      return this.pairTexts.length > this.maxSize ? this.pairTexts.slice(- this.maxSize) : this.pairTexts
    }
  },
  mounted () {
    this.maxSize = Math.floor((document.documentElement.clientWidth - 400) / 60)
    window.onresize = () => {
      this.maxSize = Math.floor((document.documentElement.clientWidth - 400) / 60)
    }
    console.log(this.maxSize)
    this.$nextTick(() => {
      this.$refs.powerInput.focus()
    })
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
    switchPowerMode () {
      this.isPowerMode = !this.isPowerMode
      if (this.isPowerMode) {
        this.$refs.powerInput.focus()
      }
    },
    powerSend () {
      var text = this.powerText.trim()
      this.powerText = ''
      pairText({'text': text}).then(res => {
        if(res) {
          this.textPaired = 1
          const str = this.$util.parseColumn(res)
          this.pairTexts.push(str)
        } else {
          this.textPaired = -1
        }
        setTimeout(() => {
          this.textPaired = 0
        }, 1000)
      })
    },
    randomSentence () {
      var text = '。' + this.random.piece.content
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
  animation: bgFloat 180s ease-in-out infinite;
  .change-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 8px;
    cursor: pointer;
    transition: all 1s;
    &:hover {
      background: @card-bg;
    }
  }
  .power-mask {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: @mask-bg;
  }
  .power-btn {
    position: absolute;
    width: 48px;
    height: 48px;
    text-align: center;
    line-height: 48px;
    bottom: 16px;
    right: 16px;
    background: @primary-color;
    border-radius: 50%;
    cursor: pointer;
    animation: rotate 60s linear infinite;
    -webkit-animation: rotate 60s linear infinite;
    transition: all 1s;
    &:hover {
      background: darken(@primary-color, 10%);
    }
    @keyframes rotate {
      0% {transform: rotateZ(0deg); background: @primary-color; box-shadow: @white-bg 0px 0px 0px;}
      50% {transform: rotateZ(900deg); background: @card-bg; box-shadow: @white-bg 0px 0px 60px;}
      100% {transform: rotateZ(1800deg); background: @primary-color; box-shadow: @white-bg 0px 0px 0px;}
    }
    @-webkit-keyframes rotate {
      0% {transform: rotateZ(0deg); background: @primary-color; box-shadow: @white-bg 0px 0px 0px;}
      50% {transform: rotateZ(900deg); background: @card-bg; box-shadow: @white-bg 0px 0px 60px;}
      100% {transform: rotateZ(1800deg); background: @primary-color; box-shadow: @white-bg 0px 0px 0px;}
    }
  }
  .power-input {
    .v-power-text();
    float: right;
    width: auto;
    height: 80vh;
    width: 48px;
    text-align: center;
    margin-right: 40px;
    margin-top: calc(10vh + 18px);
    border: none;
    color: white;
    background: transparent;
    border-right: 2px @white-bg solid;
    outline: none;
    writing-mode: tb-rl;
    overflow: hidden;
    resize: none;
  }
  .pair-text-container {
    .center-parent();
    width: calc(100% - 400px);
    height: 80vh;
    right: 32px;
    text-align: right;
    overflow: hidden;
    .pair-text {
      display: inline-block;
      vertical-align: top;
      margin: 16px;
      color: @white-bg;
      transition: all 1s;
      cursor: pointer;
      &:hover {
        color: white;
        line-height: @font-power * 1.5;
      }
    }
  }
}
</style>
