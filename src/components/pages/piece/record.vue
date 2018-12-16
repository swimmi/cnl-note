<template>
  <div ref="record" class="drawer-form">
    <div class="text-row-container">
      <span class="text-row">{{ textRows[cIndex - 1] || '...' }}</span>
      <span class="text-row current-text">{{ textRows[cIndex] || '...' }}</span>
      <span class="text-row">{{ textRows[cIndex + 1] || '...' }}</span>
    </div>
    <div class="records-container">
      <audio src="" hidden ref="audio" />
      <div v-for="(item, index) in records" :key="index">
        <span>{{ item.text }}</span><Button @click="playRecord(item)"><Icon type="ios-play-outline" /></Button>
      </div>
    </div>
    <Spin size="large" fix v-if="isRecording"></Spin>
    <div v-if="cIndex < textRows.length" class="record-btn" @click="handleRecord">
      <div class="record-bg" :class="{'record-bg-stop': isRecording}"></div>
      <div class="record-start" :class="{'record-stop': isRecording}"></div>
    </div>
  </div>
</template>
<script>
import { getPieceContent, updatePieceContent, recordPiece } from '@/api/piece'
import Recorder from 'recorder-js'
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      content: '',
      textRows: [],
      records: [],
      cIndex: 0,
      recorder: null,
      blob: null,
      isRecording: false,
      recordFile: ''
    }
  },
  mounted () {
    getPieceContent({id: this.id}).then(res => {
      if (res) {
        this.content = res.content
        this.textRows = this.content.split('。')
      }
    })
    this.init()
  },
  methods: {
    init () {
      document.onkeyup = (event) => {
        let e = event || window.event || arguments.callee.caller.arguments[0]
        if (e && e.keyCode == 32) {
          if (this.cIndex < this.textRows.length) {
            this.handleRecord()
          }
        }
      }
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.recorder = new Recorder(audioContext, {})
      navigator.mediaDevices.getUserMedia({audio: true})
        .then(stream => this.recorder.init(stream))
        .catch(err => console.log(err))
    },
    handleRecord () {
      if (!this.isRecording) {
        this.recorder.start().then(() => this.isRecording = true)
      }
      if (this.isRecording) {
        this.recorder.stop().then(({blob, buffer}) => {
          this.blob = blob
          this.isRecording = false
          this.records.push({
            text: this.textRows[this.cIndex],
            file: blob
          })
          this.cIndex ++
          this.uploadRecord()
        })
      }
    },
    playRecord (item) {
      this.$refs.audio.play()
    },
    uploadRecord () {
      const config = {
        headers: {'Content-Type': 'multipart/form-data'}
      }
      var form = new FormData()
      form.append('file', this.blob, `${this.cIndex}.wav`)
      form.append('id', this.id)
      this.$http.post('/api/upload', form, config).then(res => {
        console.log(res)
      })
    },
    submit () {
      updatePieceContent({
        id: this.id,
        content: this.piece.content
      }).then(res => {
        this.$bus.emit('refresh', this.id)
        this.$bus.emit('back')
      })
      this.$Message.success(this.$str.submit_success);
    }
  }
}
</script>
<style lang="less" scoped>
.text-row {
  display: block;
  width: 100%;
  height: @title-height;
  font-size: @subtitle-size;
  line-height: @title-height;
  text-align: center;
  color: @text-vice;
}
.current-text {
  font-size: @title-size;
  color: @primary-color;
  z-index: 99;
}
.record-btn {
  .center-horizontal();
  @size: 60px;
  width: @size;
  height: @size;
  bottom: @size;
  cursor: pointer;
  opacity: .8;
  z-index: 99;
  &:hover {
    opacity: 1;
  }
  .record-bg {
    width: 100%;
    height: 100%;
    background-color: @primary-color;
    border-radius: 50%;
  }
  .record-bg-stop {
    border: 1px @primary-color solid;
    background-color: @white-bg;
  }
  .record-start {
    .center-parent();
    width: 40%;
    height: 40%;
    background-color: @white-bg;
    border-radius: 50%;
  }
  .record-stop {
    width: 33%;
    height: 33%;
    background-color: @primary-color;
    border-radius: 0;
  }
}
</style>
