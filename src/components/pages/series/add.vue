<template>
  <Form :model="newSeries" :label-width="40" ref="newSeries" class="drawer-form">
    <FormItem label="书籍">
      <Select
        v-model="newSeries.book"
        filterable
        remote
        :remote-method="queryBooks"
        :loading="loadingBook"
        @on-change="getSeries">
        <Option v-for="(item, index) in bookList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem label="归属">
      <Select
        v-model="newSeries.parent"
        filterable>
        <Option v-for="(item, index) in seriesList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem label="标题">
      <Input v-model="newSeries.title" placeholder="请输入"></Input>
    </FormItem>
    <FormItem label="底层">
      <Switch v-model="isLast" @on-change="changeIsLast"/>
    </FormItem>
    <FormItem label="序号">
      <InputNumber :max="9999" :min="1" v-model="newSeries.number"></InputNumber>
    </FormItem>
    <FormItem label="简介">
        <Input v-model="newSeries.introduce" type="textarea" :autosize="{minRows: 5,maxRows: 8}" placeholder="请输入"></Input>
    </FormItem>
    <FormItem>
        <Button type="primary" @click="submit">提交</Button>
        <Button style="margin-left: 8px" @click="$bus.emit('back')">取消</Button>
    </FormItem>
  </Form>
</template>
<script>
export default {
  data () {
    return {
      newSeries: {
        book: 0,
        parent: 0,
        title: '',
        introduce: '',
        lastLevel: 0,
        number: 0
      },
      loadingBook: false,
      isLast: false,
      bookList: [],
      allBooks: [],
      seriesList: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getBooks()
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    changeIsLast: function (value) {
      this.newSeries.lastLevel = value ? 1 : 0
    },
    queryBooks (query) {
      if (query !== '') {
        this.loadingBook = true
        setTimeout(() => {
          this.loadingBook = false
          this.bookList = this.allBooks.filter(item => item.label.indexOf(query) > -1)
        }, 200)
      } else {
        this.bookList = []
      }
    },
    getBooks () {
      this.$http.get('/api/allBooks')
        .then(response => {
          this.allBooks = response.data.map(item => {
            return {
              value: item.id,
              label: item.title
            }
          })
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getSeries () {
      this.$http.post('/api/allSeries', {
        book: this.newSeries.book
      })
        .then(response => {
          this.seriesList = response.data.map(item => {
            return {
              value: item.id,
              label: item.title
            }
          })
          this.seriesList.push({value: 0, label: '无'})
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    submit () {
      this.$http.post('/api/addSeries', {
        series: this.newSeries
      })
        .then(response => {
          console.log(response)
          this.handleReset('newSeries')
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
