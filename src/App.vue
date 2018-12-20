<template>
  <div id="app" :style="{backgroundImage: 'url(static/images/bg/'+ theme + '.jpg)'}">
    <router-view v-if="isRouterAlive" :piece="random.piece"/>
    <router-view v-else name="locker" :random="random"/>
    <power-modal v-if="isPowerMode" :mode="mode" :params="params"></power-modal>
    <Icon
      class="change-btn"
      type="ios-sync"
      size="24"
      :title="$str.change + $str.background"
      @click="changeBg" />
    <Icon
      class="power-btn"
      :type="isPowerMode ? 'ios-moon' : 'ios-sunny'"
      size="24"
      color="#fff"
      @click="switchPowerMode()" />
    <audio src="" hidden ref="audio" />
  </div>
</template>
<script>
import PowerModal from '@/components/power'
import { getPieceRandom } from '@/api/piece'
export default {
  name: 'App',
  components: {
    PowerModal
  },
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
      audioIndex: -1,        // 当前播放的音频索引
      audioList: [],
      isPlayingAudio: false,
      maxSize: 16,
      mode: 0,                     // Power模式的子模式
      params: null                 // Power模式的参数
    }
  },
  mounted () {
    this.$bus.on('stopAudio', this.stopAudio)
    this.$bus.on('setAudioList', this.setAudioList)
    this.$bus.on('controlAudio', this.controlAudio)
    this.$bus.on('switchPowerMode', this.switchPowerMode)
    this.maxSize = Math.floor((document.documentElement.clientWidth - 400) / 60) - 2
    window.onresize = () => {
      this.maxSize = Math.floor((document.documentElement.clientWidth - 400) / 60) - 2
    }
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
    switchPowerMode (mode, params) {
      this.isPowerMode = !this.isPowerMode
      this.mode = mode || 0
      this.params = params || null
    },
    randomSentence () {
      const sentences = this.$util.splitToSentences(this.random.piece.content)
      const rand = Math.floor((Math.random() * sentences.length))
      this.random.sentence = this.$util.parseColumn(sentences[rand])
    },
    changeBg () {
      this.theme = Math.floor(Math.random() * 20)
    },
    reload () {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    },
    playAudio () {
      if (this.$refs.audio) {
        const root = this.$util.uploadPath + 'records/'
        this.$refs.audio.src = root + this.audioList[this.audioIndex]
        this.$refs.audio.play()
        this.isPlayingAudio = true
      }
    },
    stopAudio () {
      this.isPlayingAudio = false
      if (this.$refs.audio) {
        this.$refs.audio.removeEventListener('ended', this.playAudioList)
        this.$refs.audio.pause()
        this.audioIndex = -1
      }
    },
    controlAudio () {
      if (this.$refs.audio) {
        if (this.isPlayingAudio) {
          this.$refs.audio.pause()
        } else {
          this.$refs.audio.play()
        }
        this.isPlayingAudio = !this.isPlayingAudio
      }
    },
    playAudioList () {
      if (this.audioIndex == -1 && this.$refs.audio) {
        this.$refs.audio.addEventListener('ended', this.playAudioList)
      }
      this.audioIndex ++
      if (this.audioIndex < this.audioList.length) {
        if (this.audioIndex > 1) {
          setTimeout(() => {
            this.$bus.emit('playNextRecord')
          }, 500)
        }
        this.playAudio()
      } else {
        setTimeout(() => {
          this.$bus.emit('playNextRecord')
        }, 500)
        this.audioIndex = -1
        this.$refs.audio.removeEventListener('ended', this.playAudioList)
      }
    },
    setAudioList (list) {
      this.audioList = list
      this.playAudioList()
    },
  }
}
</script>
<style lang="less">
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
    padding: 4px;
    cursor: pointer;
    color: @primary-color;
    animation: rotateZ 1s linear infinite;
    .hover-fade();
    &:hover {
      background-color: @card-bg;
    }
    @keyframes rotateZ {
      0% { transform: rotateZ(360deg) }
      100% { transform: rotateZ(0deg) }
    }
  }
  .power-btn {
    position: absolute;
    @size: 40px;
    width: @size;
    height: @size;
    text-align: center;
    line-height: @size;
    bottom: 16px;
    right: 16px;
    background: @primary-color;
    border-radius: 50%;
    cursor: pointer;
    animation: rotatePower 60s linear infinite;
    transition: all 1s;
    &:hover {
      background: darken(@primary-color, 10%);
    }
    @keyframes rotatePower {
      0% {transform: rotateZ(0deg); background: @primary-color; box-shadow: @white-bg 0px 0px 0px;}
      50% {transform: rotateZ(900deg); background: fade(@primary-color, 10%); box-shadow: @white-bg 0px 0px 60px;}
      100% {transform: rotateZ(1800deg); background: @primary-color; box-shadow: @white-bg 0px 0px 0px;}
    }
  }
}
</style>
