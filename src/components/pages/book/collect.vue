<template>
  <Spin v-if="loading" class="center-parent" />
  <Form v-else :model="bookCatalog" :label-width="40" ref="book" class="drawer-form">
    <FormItem :label="$str.book">
      <Select
        v-model="bookCatalog.book"
        filterable
        remote
        label-in-value
        @on-change="selectedBook"
        :remote-method="queryBooks"
        :loading="loadingBook">
        <Option v-for="(item, index) in bookList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.catalog">
      <Collapse accordion v-model="bookCatalog.catalog">
        <Panel name="0">
            {{ bookName }} <Input style="width: 200px"/> <Button @click.stop="addChild" size="small"><Icon type="md-add" /></Button>
          <div slot="content">
            <Collapse accordion v-model="value4">
              <Panel v-for="i in 4" name="1">
                  史蒂夫·乔布斯
                  <div slot="content">
                      <Input type="textarea" :autosize="{minRows: 5,maxRows: 8}" :placeholder="$str.input_tip"></Input>
                      <Collapse accordion v-model="value4">
                          <Panel v-for="j in 4" name="1-1">
                              iPhone
                              <p slot="content">iPhone，是美国苹果公司研发的智能手机，它搭载iOS操作系统。第一代iPhone于2007年1月9日由苹果公司前首席执行官史蒂夫·乔布斯发布，并在2007年6月29日正式发售。</p>
                          </Panel>
                      </Collapse>
                  </div>
              </Panel>
            </Collapse>
          </div>
        </Panel>
      </Collapse>
    </FormItem>
    <FormItem>
      <Button type="primary" @click="submit">{{ $str.submit }}</Button>
      <Button style="margin-left: 8px" @click="$bus.emit('back')">{{ $str.back }}</Button>
    </FormItem>
  </Form>
</template>
<script>
import { allBook } from '@/api/book'
export default {
  data () {
    return {
      bookCatalog: {
        catalog: [
        {
          title: '123',
          expand: true,
          render: (h, { root, node, data }) => {
          return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%"
                }
              },
              [
              h("span", [
                  h("Icon", {
                    props: {
                      type: "ios-folder-outline"
                    },
                    style: {
                      marginRight: "8px"
                    }
                  }),
                  h("span", data.title)
              ]),
              h(
                "span",
                {
                  style: {
                      display: "inline-block",
                      float: "right",
                      marginRight: "32px"
                  }
                },
                [
                h("Button", {
                  props: Object.assign({}, this.buttonProps, {
                    icon: "ios-add",
                    type: "primary"
                  }),
                  style: {
                    width: "64px"
                  },
                  on: {
                    click: () => {
                        this.append(data)
                    }
                  }
                })
                ]
              )
            ]
          );
          },
          children: []
        }]
      },
      buttonProps: {
        type: "default",
        size: "small"
      },
      bookName: '',
      bookId: '',
      loadingBook: false,
      allBooks: [],
      bookList: [],
      loading: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 获取书籍列表以供选择
      allBook().then(res => {
        this.allBooks = res.map(item =>  {
          return {
            value: 1,
            label: item.title
          }
        })
        this.loading = false
      })
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
    selectedBook (val) {
      if (val) {
        this.bookId = val.value
        this.bookName = val.label
      }
    },
    submit () {
      console.log(this.bookCatalog.catalog)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
