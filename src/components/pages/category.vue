<template>
  <div class="category">
    <Divider>{{ $str.index }}</Divider>
    <Tree :data="categoryList" @on-select-change="selectCategory"></Tree>
    <Tree :data="dynastyList" @on-select-change="selectDynasty"></Tree>
  </div>
</template>
<script>
import data from '@/store/data.js'
import { getAuthorByDynasty } from '@/api/author'
export default {
  name: 'index-category',
  data () {
    return {
      categoryList:
      [{
        title: this.$str.category + this.$str.index,
        expand: true,
        children: data.category
      }],
      dynastyList:
      [{
        title: this.$str.author + this.$str.dynasty,
        expand: true,
        children: data.dynasty
      }]
    }
  },
  mounted () {
    this.dynastyList[0].children.forEach(item => {
      getAuthorByDynasty({dynasty: item.id}).then(res => {
        var authors = res.map(subitem => {
          return {
            id: subitem._id,
            title: subitem.name.full,
            dynasty: item.id,
            is_author: true
          }
        })
        authors.push({id: 0, title: this.$str.name_unknown, dynasty: item.id, is_author: true})
        item.children = authors
      })
    })
  },
  methods: {
    selectCategory: function (item) {
      if (item.length > 0) {
        if (item[0] != null && item[0].id > 0) {
          this.$emit('selectCategory', item[0].id, item[0].title)
        }
      }
    },
    selectDynasty: function (item) {
      if (item.length > 0) {
        if (item[0].is_author) {
          this.$emit('selectAuthor', item[0].id, item[0].title, item[0].dynasty)
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.category {
  height: calc(100vh - 48px * 2 - 12px * 2 - 2px);
  overflow-y: auto;
}
</style>
