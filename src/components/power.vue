<template>
  <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
    <div class="power-mask animated">
      <textarea
        ref="powerInput"
        @keyup.enter="powerSend"
        autofocus
        class="power-input animated"
        :class="{'shake': textPaired == -1, 'bounce': textPaired == 1}"
        v-model="powerText"
        :placeholder="tipText"></textarea>
      <div class="pair-text-container">
        <transition-group>
          <span class="v-power-text pair-text" v-for="(item, index) in showPairSentences" :key="item + index">{{ item }}</span>
        </transition-group>
      </div>
    </div>
  </transition>
</template>
<script>
import { getPiece } from '@/api/piece'
import { pairText } from '@/api/common'
export default {
  props: {
    mode: {
      type: Number,
      required: true,
      default: 0            // 0: 对句模式； 1：背诵模式
    },
    params: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      textPaired: 0,        // 匹配到上下句
      powerText: '',
      powerSentences: [],
      tipText: '',
      piece: null,
      reciteMode: {
        sentences: [],
        index: 0,
      }
    }
  },
  computed: {
    showPairSentences: function () {
      return this.powerSentences.length > this.maxSize ? this.powerSentences.slice(- this.maxSize) : this.powerSentences
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.$refs.powerInput.focus()
    })
    switch (this.mode) {
      case 0:
        this.tipText = this.$str.power_tip
        break
      case 1:
        getPiece({'id': this.params.id}).then(res => {
          this.piece = res
          this.tipText = `${this.$str.recite_tip}︻${this.piece.title}︼`
          this.reciteMode.sentences = this.$util.splitToSentences(res.content)
        })
        break
    }
  },
  methods: {
    pairText () {
      var text = this.powerText.trim()
      this.powerText = ''
      pairText({'text': text}).then(res => {
        if(res) {
          this.textPaired = 1
          const sts = this.$util.parseColumn(res)
          this.powerSentences.push(sts)
        } else {
          this.textPaired = -1
        }
        setTimeout(() => {
          this.textPaired = 0
        }, 1000)
      })
    },
    reciteText () {
      const sts = this.$util.parseColumn(this.reciteMode.sentences[this.reciteMode.index])
      var text = this.powerText.trim()
      if (this.$util.textMatch(text, sts)) {
        this.textPaired = 1
        this.reciteMode.index ++
        this.powerText = ''
        this.powerSentences.push(sts)
        if (this.powerSentences.length == this.reciteMode.sentences.length) {
          setTimeout(() => {
            this.$bus.emit('switchPowerMode')
            this.$bus.emit('recitePieceDone')
          }, 1000)
        }
      } else {
        this.textPaired = -1
      }
      setTimeout(() => {
        this.textPaired = 0
      }, 1000)
    },
    powerSend () {
      switch (this.mode) {
        case 0:
          this.pairText()
          break
        case 1:
          this.reciteText()
          break;
      }
    }
  }
}
</script>
<style lang="less" scoped>
.power-mask {
    font-family: 'Xingkai';
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: @mask-bg;
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
    width: calc(100% - 440px);
    height: 80vh;
    text-align: right;
    overflow: hidden;
    .pair-text {
      display: inline-block;
      vertical-align: top;
      margin: 16px;
      color: @text-white;
      transition: all 1s;
      cursor: pointer;
      &:hover {
        color: white;
        line-height: @font-power * 1.5;
      }
    }
  }
</style>
