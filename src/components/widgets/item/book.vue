<template>
  <Card class="book" :padding="0" dis-hover :bordered="false">
    <div class="book-container" @mouseenter="infoShow = false" @mouseleave="infoShow = true">
      <div class="book-header">
        <div class="header-left">
        </div>
        <div class="header-right">
          <span v-if="this.book.lastViewAt"><Time :time="this.book.lastViewAt"/> <Icon type="ios-book-outline" size="16" color="#aaa"/></span>
          <span v-else>{{ $str.not_yet + $str.read }}</span>
        </div>
      </div>
      <div class="book-main">
        <span class="book-title v-title">{{ book.title }}</span>
        <span class="book-author v-title">{{ book.author.name.full }}<Icon type="ios-barcode-outline" />著</span>
      </div>
      <div class="book-footer">
        <transition enter-active-class="fadeInLeft" leave-active-class="fadeOutLeft">
          <div v-show="infoShow" class="book-info animated">
            <div class="menu-item"><span><Icon type="ios-glasses-outline" size="24" color="#666"/> {{ book.number.time + ' ' + $str.time_unit }}</span></div>
            <div class="menu-item"><span><Icon type="ios-eye-outline" size="24" color="#666"/> {{ book.number.duration + ' ' + $str.duration_unit }}</span></div>
          </div>
        </transition>
        <transition enter-active-class="fadeInRight" leave-active-class="fadeOutRight">
          <div v-show="!infoShow" class="book-action animated">
          <div class="menu-item"><span @click="action('read')">{{ $str.read }}</span></div>
          <div class="menu-item"><span @click="action('modify')">{{ $str.modify }}</span></div>
          <div class="menu-item"><span @click="action('category')">{{ $str.category }}</span></div>
          </div>
        </transition>
      </div>
    </div>
  </Card>
</template>
<script>
export default {
  name: 'book-item',
  props: {
    book: {
      type: Object,
      requeire: true
    }
  },
  data () {
    return {
      infoShow: true
    }
  },
  methods: {
    action (name) {
      if (name == 'read') {
        this.book.number.time ++
      }
      this.$bus.emit('actionBook', name, this.book._id)
    }
  }
}
</script>
<style lang="less" scoped>
.book {
  position: relative;
  width: 240px;
  margin: 16px auto;
  background: @white-bg;
  border-radius: 0px;
  overflow: hidden;
  cursor: pointer;
  .hover-fade();
  .book-container {
    display: flex;
    height: 320px;
    padding: 8px;
    flex-direction: column;
    .book-header {
      width: 100%;
      font-size: @subtext-size;
      color: @text-grey;
      display: flex;
      .header-left {
        flex: 1;
        text-align: left;
      }
      .header-right {
        flex: 1;
        text-align: right;
      }
    }
    .book-main {
      height: calc(100% - @title-height);
      padding: 0px 4px 4px 16px;
      color: @text-black;
      @border-size: 4px;
      @pad: 6px;
      span {
        width: calc(@v-title-width + @pad * 3);
        text-align: center;
        padding: @pad * 2 @pad;
      }
      .book-title {
        display: inline-block;
        vertical-align: top;
        border: @border-size solid @primary-color;
        line-height: calc(@v-title-width + @border-size);
        color: @primary-color;
      }
      .book-author {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: calc(@v-title-width + @border-size * 4);
        line-height: calc(@v-title-width + @border-size);
        padding: 4px @border-size;
        color: @text-black;
      }
    }
    .book-footer {
      position: relative;
      height: @title-height;
      text-align: center;
      vertical-align: bottom;
      .book-info {
        position: absolute;
        width: 100%;
        display: flex;
      }
      .book-action {
        position: absolute;
        width: 100%;
        display: flex;
      }
      .menu-item {
        flex: 1;
        text-align: center;
        line-height: @title-height;
        color: @text-grey;
        cursor: pointer;
        span {
          display: block;
          width: 100%;
          &:hover {
            color: @primary-color;
          }
        }
      }
    }
  }
}
</style>
