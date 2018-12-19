<template>
  <div ref="record" class="drawer-form">
    <div class="text-row-container">
      <span class="text-row">{{ textRows[cIndex - 1] || '...' }}</span>
      <span class="text-row current-text">{{ textRows[cIndex] || '...' }}</span>
      <span class="text-row">{{ textRows[cIndex + 1] || '...' }}</span>
    </div>
    <div class="record-container">
      <audio src="" hidden ref="audio" />
      <div class="record-item-container" ref="recordContainer">
        <div v-for="(item, index) in records" :key="index" class="record-item animated fadeInDown" :class="{'playing-item': index == playIndex}">
          <span class="record-text" @click="playRecord(item)">{{ (index + 1) + '. ' + item.text }}</span>
          <span class="record-action">
            <span class="circle-icon-btn" @click="modifyRecord(index)" :title="$str.modify + $str.record"><Icon type="ios-recording" size="24"/></span>
          </span>
        </div>
      </div>
    </div>
    <Spin size="large" fix v-if="isRecording"></Spin>
    <div v-if="cIndex < textRows.length" class="record-btn" @click="handleRecord">
      <div class="record-bg" :class="{'record-bg-stop': isRecording}"><Icon :type="isRecording ? 'ios-mic-off': 'ios-mic'" size="32" :color="isRecording ? 'red' : 'white'"/></div>
    </div>
    <div v-else class="record-btn">
      <div v-if="!isPlaying" class="record-bg" @click="playRecords"><Icon type="ios-play" size="32" color="white"/></div>
      <div v-else class="record-bg" @click="pauseRecords"><Icon type="ios-pause" size="32" color="white"/></div>
    </div>
    <div v-show="isRecording" class="cancel-btn" @click="cancelRecord" :title="$str.cancel + $str.record"><Icon type="ios-close" size="32" color="red"/></div>
  </div>
</template>
<script>
import { getPiece, updatePieceContent, uploadPieceRecords } from '@/api/piece'
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
      title: '',
      author: '',
      content: '',
      textRows: [],
      records: [],
      cIndex: 0,
      playIndex: -1,
      recorder: null,
      isRecording: false,
      isPlaying: false,
      recordFile: ''
    }
  },
  mounted () {
    getPiece({id: this.id}).then(res => {
      if (res) {
        this.title = res.title
        this.author = res.author.name.full
        this.content = res.content
        this.textRows = this.$util.splitToSentences(res.content)
        this.textRows.unshift(this.title, this.author)
        if (res.records.length > 0) {
          res.records.forEach((item, index) => {
            this.records.push({
              text: this.textRows[index],
              url: item
            })
          })
          this.cIndex = res.records.length
        }
      }
    })
    this.init()
  },
  methods: {
    init () {
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
          this.isRecording = false
          const item = {
            text: this.textRows[this.cIndex],
            file: blob
          }
          this.records.splice(this.cIndex, 1, item)
          if (this.records.length == this.textRows.length) {
            this.cIndex = this.textRows.length
          } else {
            this.cIndex ++
          }
          setTimeout(() => {
            this.$refs.recordContainer.scrollTop = this.$refs.recordContainer.scrollHeight
          }, 500)
        })
      }
    },
    playRecord (item) {
      if (item.hasOwnProperty('file')) {
        const url = window.URL.createObjectURL(item.file)
        this.$refs.audio.src = url
        this.$refs.audio.onload = function(){
          window.URL.revokeObjectURL(url)
        }
      } else {
        this.$refs.audio.src = item.url
      }
      this.$refs.audio.play()
      this.isPlaying = true
      this.$refs.audio.addEventListener('ended', this.stopRecords);
    },
    modifyRecord (index) {
      this.cIndex = index
    },
    stopRecords () {
      this.isPlaying = false
    },
    playRecords () {
      if (this.playIndex == -1) {
        this.$refs.audio.addEventListener('ended', this.playRecords)
      }
      this.playIndex ++
      if (this.playIndex < this.records.length) {
        this.playRecord(this.records[this.playIndex])
      } else  {
        this.playIndex = -1
        this.$refs.audio.removeEventListener('ended', this.playRecords)
      }
    },
    pauseRecords () {
      this.isPlaying = false
      this.$refs.audio.pause()
    },
    cancelRecord () {
      this.recorder.stop()
      this.isRecording = false
    },
    
    async submit () {
      const config = {
        headers: {'Content-Type': 'multipart/form-data'}
      }
      var form = new FormData()
      var recordList = []
      this.records.forEach((item, index) => {
        if (item.hasOwnProperty('file')) {
          const root = this.$util.uploadPath + 'records/'
          const name = `${this.id + '_' + index}.wav`
          form.append('file', item.file, name)
          recordList.push(root + name)
        } else {
          recordList.push(item.url)
        }
      })
      await this.$http.post('/api/upload', form, config)
      uploadPieceRecords({'id': this.id, 'records': recordList}).then(res => {
        this.$bus.emit('back')
      })
      this.$Message.success(this.$str.submit_success);
    }
  }
}
</script>
<style lang="less" scoped>
.text-row-container {
  .center-horizontal();
  top: 100px;
  z-index: 99;
  .text-row {
    display: block;
    width: 100%;
    height: @title-height;
    font-size: @subtitle-size;
    line-height: @title-height;
    text-align: center;
    color: @text-vice;
    opacity: .7;
    &:hover {
      opacity: 1;
    }
  }
  .current-text {
    font-size: @title-size;
    color: @primary-color;
  }
  .text-title {
    font-size: @title-size * 1.2;
    color: @primary-color;
    font-weight: bold;
    margin-bottom: 16px;
  }
}
.record-container {
  .center-parent();
  margin: 24px auto 0px auto;
  width: 90%;
  height: @list-header-height * 10;
  overflow: hidden;
  .record-item-container {
    width: calc(100% + @scrollbar-width);
    height: 100%;
    overflow-y: auto;
    .record-item {
      display: block;
      width: 100%;
      line-height: @list-header-height;
      height: @list-header-height;
      padding: 0px 32px;
      margin: 4px 0px;
      border-radius: @base-radius;
      transition: all .5s;
      background-color: darken(@card-bg, 10%);
      .hover-fade();
      &:hover {
        background-color: @white-bg;
      }
      .record-text {
        flex: 1;
        font-size: @subtitle-size;
        &:hover {
          color: @primary-color;
        }
      }
      .record-action {
        float: right;
      }
    }
    .playing-item {
      color: @bookmark-color;
    }
  }
}
.record-btn {
  .center-horizontal();
  @size: 60px;
  width: @size;
  height: @size;
  bottom: @size;
  z-index: 99;
  .hover-fade();
  .record-bg {
    .flex-center();
    width: 100%;
    height: 100%;
    background-color: @primary-color;
    border-radius: 50%;
  }
  .record-bg-stop {
    border: 1px @stamp-color solid;
    background-color: @white-bg;
  }
}
.cancel-btn {
  .center-horizontal();
  width: 32px;
  height: 32px;
  bottom: 16px;
  z-index: 99;
  .hover-fade();
}
</style>
