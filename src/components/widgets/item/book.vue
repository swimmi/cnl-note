<template>
  <Card class="book">
    <div class="book-title"><span class="v-title">{{ book.title }}</span></div>
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
  }
}
</script>
<style lang="less" scoped>
.book {
  width: 160px;
  height: 200px;
  margin: 8px auto;
  background: @primary-color;
  cursor: pointer;
  .book-title {
    @border-size: 4px;
    width: calc(@v-title-width + @border-size * 6);
    border: @border-size solid white;
    background: white;
    span {
      width: calc(@v-title-width + @border-size * 4);
      padding: 12px 4px;
      border: @border-size solid @primary-color;
      line-height: calc(@v-title-width + 4px);
    }
  }
}
</style>
