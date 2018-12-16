<template>
  <Card class="book" :padding="0" dis-hover :bordered="false">
    <div class="book-title"><span class="v-title">{{ book.title }}</span></div>
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
  margin: 8px auto;
  padding: 24px;
  background: @white-bg;
  cursor: pointer;
  transition: all 1s;
  -webkit-transition: all 1s;
  opacity: 0.7;
  &:hover {
    background: @primary-color;
    opacity: 1;
  }
  &:hover .book-footer {
    color: @white-bg;
    opacity: 1;
  }
  .book-title {
    @border-size: 4px;
    width: calc(@v-title-width + @border-size * 6);
    border: @border-size solid @white-bg;
    background: @white-bg;
    color: @text-black;
    span {
      width: calc(@v-title-width + @border-size * 4);
      padding: 12px @border-size;
      border: @border-size solid @primary-color;
      line-height: calc(@v-title-width + @border-size);
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
      color: @card-bg;
      cursor: pointer;
      span {
        display: block;
        width: 100%;
        &:hover {
          color: white;
        }
      }
    }
  }
}
</style>
