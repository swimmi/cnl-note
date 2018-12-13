<template>
  <Form :model="newBook" :label-width="40" ref="newBook" class="drawer-form">
    <FormItem label="书名">
      <Input v-model="newBook.title" placeholder="请输入"></Input>
    </FormItem>
    <FormItem label="别名">
      <Input v-model="newBook.alias" placeholder="请输入"></Input>
    </FormItem>
    <FormItem label="书类">
      <Select v-model="newBook.category" filterable>
        <OptionGroup
          v-for="(item, index) in categoryList"
          :key="index"
          :label="item.title">
          <Option
            v-for="(subItem, subIndex) in item.children"
            :key="subIndex"
            :value="subItem.id">{{ subItem.title }}</Option>
        </OptionGroup>
      </Select>
    </FormItem>
    <FormItem :label="$str.author">
      <Select
        v-model="newBook.author"
        filterable
        remote
        :remote-method="queryAuthors"
        :loading="loadingAuthor">
        <Option v-for="(item, index) in authorList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem label="朝代">
      <Select v-model="newBook.dynasty">
        <Option
          v-for="(item, index) in dynastyList"
          :value="item.id"
          :key="index">{{ item.title }}</Option>
      </Select>
    </FormItem>
    <FormItem label="标签">
      <Input v-model="tagText" placeholder="请输入" style="width: 120px" />
      <Button icon="ios-add" type="dashed" @click="handleAdd"></Button><Br />
      <Tag v-for="item in newBook.tags" :key="item" :name="item" closable @on-close="handleClose">{{ item }}</Tag>
    </FormItem>
    <FormItem label="简介">
        <Input v-model="newBook.introduce" type="textarea" :autosize="{minRows: 5,maxRows: 8}" placeholder="请输入"></Input>
    </FormItem>
    <FormItem>
        <Button type="primary" @click="submit">提交</Button>
        <Button style="margin-left: 8px" @click="$bus.emit('back')">取消</Button>
    </FormItem>
  </Form>
</template>
<script>
import data from '@/store/data.js'
export default {
  data () {
    return {
      newBook: {
        title: '',
        alias: '',
        category: 0,
        author: 0,
        dynasty: 0,
        tags: [],
        introduce: ''
      },
      tagText: '',
      categoryList: [],
      dynastyList: [],
      loadingAuthor: false,
      allAuthors: [],
      authorList: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.categoryList = data.category
      this.dynastyList = data.dynasty
      this.getAuthors()
    },
    handleAdd () {
      if (this.tagText.trim().length) {
        this.newBook.tags.push(this.tagText)
        this.tagText = ''
      }
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    handleClose (event, name) {
      const index = this.newBook.tags.indexOf(name)
      this.newBook.tags.splice(index, 1)
    },
    queryAuthors (query) {
      if (query !== '') {
        this.loadingAuthor = true
        setTimeout(() => {
          this.loadingAuthor = false
          this.authorList = this.allAuthors.filter(item => item.label.indexOf(query) > -1)
        }, 200)
      } else {
        this.authorList = []
      }
    },
    getAuthors () {
      this.$http.get('/api/allAuthors')
        .then(response => {
          for (let i = 0; i < response.data.length; i++) {
            let item = response.data[i]
            this.allAuthors.push({value: item.id, label: item.xing + item.ming + ' ' + item.xing + item.zi + ' ' + item.hao})
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    submit () {
      this.newBook.tags = this.newBook.tags.join(',')
      this.$http.post('/api/addBook', {
        book: this.newBook
      })
        .then(response => {
          console.log(response)
          this.handleReset('newBook')
          this.$Message.success('添加成功')
          this.$bus.emit('back')
        })
        .catch(error => {
          console.log(error)
          this.$Message.success('添加失败')
        })
    }
  }
}
</script>
