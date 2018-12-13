<template>
  <Spin v-if="loading" class="center-parent"></Spin>
  <Form v-else :model="book" :rules="bookValidate" :label-width="60" ref="book" class="drawer-form">
    <FormItem :label="$str.book_title" prop="title">
      <Input v-model="book.title" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.alias" prop="alias">
      <Input v-model="book.alias" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.book_category" prop="category">
      <Select v-model="book.category" filterable>
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
    <FormItem :label="$str.author" prop="author">
      <Select
        v-model="book.author"
        filterable
        remote
        :remote-method="queryAuthors"
        :loading="loadingAuthor">
        <Option v-for="(item, index) in authorList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.dynasty" prop="dynasty">
      <Select v-model="book.dynasty">
        <Option
          v-for="(item, index) in dynastyList"
          :value="item.id"
          :key="index">{{ item.title }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.tag" prop="tag">
      <Input v-model="tagText" :placeholder="$str.input_tip" style="width: 120px" />
      <Button icon="ios-add" type="dashed" @click="handleAdd"></Button><Br />
      <Tag v-for="item in book.tags" :key="item" :name="item" closable @on-close="handleClose">{{ item }}</Tag>
    </FormItem>
    <FormItem :label="$str.prologue" prop="prologue">
        <Input v-model="book.prologue" type="textarea" :autosize="{minRows: 5,maxRows: 8}" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.introduce" prop="introduce">
        <Input v-model="book.introduce" type="textarea" :autosize="{minRows: 5,maxRows: 8}" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem>
        <Button type="primary" @click="submit">{{ $str.submit }}</Button>
        <Button style="margin-left: 8px" @click="$bus.emit('back')">{{ $str.back }}</Button>
    </FormItem>
  </Form>
</template>
<script>
import data from '@/store/data.js'
import { addBook } from '@/api/book'
import { allAuthor } from '@/api/author'
export default {
  data () {
    return {
      book: {
        title: '',
        alias: '',
        category: 0,
        author: 0,
        dynasty: 0,
        tags: [],
        prologue: '',
        introduce: ''
      },
      bookValidate: {
        title: [{ required: true, message: this.$str.need_input, trigger: 'blur' }],
        category: [{ required: true, type: 'number', message: this.$str.need_select, trigger: 'change' }],
        author: [{ required: true, message: this.$str.need_select, trigger: 'change' }]
      },
      tagText: '',
      categoryList: data.category,
      dynastyList: data.dynasty,
      loadingAuthor: false,
      allAuthors: [],
      authorList: [],
      loading: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 获取作者列表以供选择
      allAuthor().then(res => {
        this.allAuthors = res.map(item =>  {
          return {
            value: item._id,
            label: item.name.full
          }
        })
        this.loading = false
      })
    },
    handleAdd () {
      if (this.tagText.trim().length) {
        this.book.tags.push(this.tagText)
        this.tagText = ''
      }
    },
    handleClose (event, name) {
      const index = this.book.tags.indexOf(name)
      this.book.tags.splice(index, 1)
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
    submit () {
      this.$refs['book'].validate((valid) => {
        if (valid) {
          addBook({book: this.book}).then(res => {
            console.log(res)
            this.$bus.emit('back')
          })
          this.$Message.success(this.$str.submit)
        }
      })
    }
  }
}
</script>
