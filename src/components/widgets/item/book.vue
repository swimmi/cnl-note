<template>
  <Card class="book" :padding="0" dis-hover :bordered="false">
    <div class="book-header">
      <span class="book-title v-title">{{ book.title }}</span>
      <span class="book-author v-title">{{ book.author.name.full }}<Icon type="ios-barcode-outline" />著</span>
      <div class="info-right">
        <span v-if="this.book.lastViewAt"><Time :time="this.book.lastViewAt"/><Icon type="ios-book-outline" size="16" color="#aaa"/></span>
        <span v-else>{{ $str.not_yet + $str.read }}</span>
      </div>
    </div>
    <div class="book-footer">
      <div class="menu-item"><span @click="action('read')">{{ $str.read }}</span></div>
      <div class="menu-item"><span @click="action('modify')">{{ $str.modify }}</span></div>
      <div class="menu-item"><span @click="action('category')">{{ $str.category }}</span></div>
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
    }
  },
  methods: {
    action (name) {
      this.$bus.emit('actionBook', name, this.book._id)
    }
  }
}
</script>
<style lang="less" scoped>
.book {
  position: relative;
  width: 240px;
  height: 320px;
  margin: 16px auto;
  padding: 12px 12px 12px 24px;
  background: @white-bg;
  border: 2px @white-bg solid;
  border-radius: 0px;
  cursor: pointer;
  transition: all .3s;
  opacity: .7;
  &:hover {
    border: 2px @white-bg groove;
    opacity: 1;
  }
  &:hover .book-footer {
    color: @text-grey;
    opacity: 1;
  }
  .book-header {
    @border-size: 4px;
    color: @text-black;
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
    .info-right {
      float: right;
      color: @text-vice;
      span {
        font-size: @subtext-size;
      }
    }
  }
  .book-footer {
    position: absolute;
    width: 100%;
    bottom: 0px;
    left: 0px;
    display: flex;
    height: @title-height;
    opacity: 0;
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
</style>
