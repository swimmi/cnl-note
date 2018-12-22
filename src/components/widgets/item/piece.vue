<template>
  <Card class="piece" :padding="0" dis-hover :bordered="false">
    <div class="piece-container" @mouseenter="infoShow = false" @mouseleave="infoShow = true">
      <div class="piece-header">
        <div class="header-right">
          <span v-if="this.piece.lastViewAt"><Time :time="this.piece.lastViewAt"/> <Icon type="ios-book-outline" size="16" color="#aaa"/></span>
          <span v-else>{{ $str.not_yet + $str.read }}</span>
        </div>
      </div>
      <div class="piece-main">
        <div class="piece-title" :title="piece.title">
          <marquee v-if="piece.title.length >= 16" scrollamount="15">{{ piece.title }}</marquee>
          <span v-else>{{ piece.title }}</span>
        </div>
        <div class="piece-author"><span>{{ piece.author.name.full }}</span></div>
        <div class="piece-brief"><span>{{ piece.content }}</span></div>
      </div>
      <div class="piece-footer">
        <transition enter-active-class="fadeInLeft" leave-active-class="fadeOutLeft">
          <div v-show="infoShow" class="piece-info animated">
            <div class="menu-item"><span><Icon type="ios-glasses-outline" size="24" color="#666"/> {{ piece.number.time + ' ' + $str.time_unit }}</span></div>
            <div class="menu-item"><span><Icon type="ios-eye-outline" size="24" color="#666"/> {{ piece.number.duration + ' ' + $str.duration_unit }}</span></div>
          </div>
        </transition>
        <transition enter-active-class="fadeInRight" leave-active-class="fadeOutRight">
          <div v-show="!infoShow" class="piece-action animated">
            <div class="menu-item"><span @click="action('view')">{{ $str.view }}</span></div>
            <div class="menu-item"><span @click="action('modify')">{{ $str.modify }}</span></div>
            <div class="menu-item" @mouseleave="menuShow = false">
              <span @mouseover="menuShow = true">{{ $str.piece }}</span>
              <transition enter-active-class="flipInY" leave-active-class="flipOutY">
                <div v-show="menuShow" class="submenu animated">
                  <span class="submenu-item" @click="action('record')">{{ $str.record }}</span>
                  <span class="submenu-item" @click="action('edit')">{{ $str.edit }}</span>
                  <span class="submenu-item" @click="action('relate')">{{ $str.relate }}</span>
                </div>
              </transition>
            </div>
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
      infoShow: true
    }
  },
  methods: {
    action (name) {
      if (name == 'view') {
        this.piece.number.time ++
      }
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
  width: 90%;
  margin: 12px auto;
  background: @white-bg;
  padding: 12px 12px 6px 12px;
  cursor: pointer;
  overflow: hidden;
  .hover-fade();
  &:hover {
    background: @white-bg;
  }
  .piece-header {
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
  .piece-main {
    width: 100%;
    position: relative;
    .piece-title {
      height: @title-height;
      line-height: @title-height;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
    height: @title-height;
    .piece-info {
      position: absolute;
      width: 100%;
      display: flex;
    }
    .piece-action {
      position: absolute;
      width: 100%;
      display: flex;
    }
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
