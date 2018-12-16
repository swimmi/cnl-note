<template>
  <div class="category">
    <Tree class="tree" :data="categoryList" @on-select-change="selectCategory"></Tree>
    <Tree class="tree" :data="dynastyList" @on-select-change="selectDynasty"></Tree>
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
          this.$emit('selectAuthor', item[0].id, item[0].dynasty, item[0].title)
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.category {
  overflow-y: auto;
  padding: 12px 24px;
}
</style>
