<template>
  <Card class="piece" :padding="0" dis-hover :bordered="false">
    <div class="piece-info">
      <div class="info-left">
        <Icon v-if="hasBookmark" type="ios-bookmark" size="20" color="#f3515188"/>
      </div>
      <div class="info-right">
        <span v-show="type == 0"><Time :time="this.piece.lastViewAt"/> <Icon type="ios-book-outline" size="16" color="#aaa"/></span>
        <span v-show="type == 1"><Time :time="this.piece.createdAt"/> <Icon type="ios-add-circle-outline" size="16" color="#aaa"/></span>
      </div>
    </div>
    <div class="piece-header">
      <div class="piece-title"><span>{{ piece.title }}</span></div>
      <div class="piece-author"><span>{{ piece.author.name.full }}</span></div>
      <div class="piece-brief"><span>{{ piece.content }}</span></div>
    </div>
    <div class="piece-footer">
      <div class="menu-item"><span @click="action('view')">{{ $str.view }}</span></div>
      <div class="menu-item"><span @click="action('modify')">{{ $str.modify }}</span></div>
      <div class="menu-item" @mouseleave="menuShow = false">
        <span @click="menuShow = !menuShow">{{ $str.piece }}</span>
        <transition enter-active-class="flipInY" leave-active-class="flipOutY">
          <div v-show="menuShow" class="submenu animated">
            <span class="submenu-item" @click="action('edit')">{{ $str.edit }}</span>
            <span class="submenu-item" @click="action('relate')">{{ $str.relate }}</span>
          </div>
        </transition>
      </div>
    </div>
  </Card>
</template>
<script>
export default {
  name: 'piece-item',
  props: {
    piece: {
      type: Object,
      require: true
    },
    type: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      menuShow: false,
      showList: true
    }
  },
  computed: {
    hasBookmark: function () {
      return this.piece.bookmarks.length > 0
    }
  },
  methods: {
    action (name) {
      this.$bus.emit('actionPiece', name, this.piece._id)
    }
  }
}
</script>
<style lang="less" scoped>
.piece {
  position: relative;
  display: block;
  text-align: center;
  width: 80%;
  margin: 12px auto;
  border: none;
  background: transparent;
  padding: 12px 12px 6px 12px;
  cursor: pointer;
  transition: all 1s;
  -webkit-transition: all 1s;
  opacity: 0.7;
  &:hover {
    background: @white-bg;
    opacity: 1;
  }
  &:hover .piece-footer {
    opacity: 1;
  }
  .piece-info {
    width: 100%;
    font-size: @subtext-size;
    color: @text-grey;
    display: flex;
    .info-left {
      flex: 1;
      text-align: left;
    }
    .info-right {
      flex: 1;
      text-align: right;
    }
  }
  .piece-header {
    width: 100%;
    position: relative;
    .piece-title {
      height: @title-height;
      line-height: @title-height;
      font-size: @title-size;
      color: @primary-color;
      font-weight: bold;
    }
    .piece-author {
      height: @subtitle-height;
      line-height: @subtitle-height;
      color: @text-grey;
      font-size: @subtitle-size;
    }
    .piece-brief {
      display: -webkit-box;
      text-indent: 2em;
      text-align: left;
      height: @subtitle-height * 3;
      margin: 12px 0px;
      line-height: @subtitle-height;
      font-size: @subtitle-size;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }
  .piece-footer {
    position: relative;
    display: flex;
    height: @title-height;
    opacity: 0;
    .menu-item {
      flex: 1;
      line-height: @title-height;
      color: @primary-color;
      cursor: pointer;
      span {
        display: block;
        width: 100%;
        color: @text-grey;
        &:hover {
          color: @primary-color;
        }
      }
    }
    .submenu {
      position: absolute;
      background: @primary-color;
      bottom: @title-height;
      border-radius: @base-radius;
      right: 0px;
      width: calc(100% / 3);
      &:after {
        @size: 8px;
        content: "";
        position: absolute;
        left: calc(50% - @size);
        border-left: @size solid @card-bg;
        border-right: @size solid @card-bg;
        border-top: @size solid @primary-color;
      }
      .submenu-item {
        display: block;
        color: @white-bg;
        line-height: @title-height;
        font-size: @subtitle-size;
        &:hover {
          color: white;
        }
      }
    }
  }
}
</style>
