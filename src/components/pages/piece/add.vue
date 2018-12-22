<template>
  <Form :model="piece" :rules="pieceValidate" :label-width="60" ref="piece" class="drawer-form">
    <FormItem :label="$str.title" prop="title">
      <Input v-model="piece.title" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.title_desc" prop="desc">
        <Input v-model="piece.desc" type="textarea" :autosize="{minRows: 3}" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.author">
      <Select
        v-model="author"
        :placeholder="authorName"
        filterable
        remote
        label-in-value
        @on-change="selectedAuthor"
        :remote-method="queryAuthors"
        :loading="loadingAuthor">
        <Option v-for="(item, index) in authorList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem v-if="authorUnknown" :label="$str.dynasty">
      <Select v-model="piece.dynasty">
        <Option
          v-for="(item, index) in dynastyList"
          :key="index"
          :value="item.id">{{ item.title }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.book_category">
      <Select v-model="piece.category" filterable>
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
    <FormItem :label="$str.content" prop="content">
        <Input
          v-model="piece.content"
          type="textarea"
          :autosize="{minRows: 8, maxRows: 12}"
          :placeholder="$str.input_tip"
          onpaste="return false;"></Input>
    </FormItem>
    <FormItem :label="$str.lock" prop="locked">
      <Switch v-model="piece.locked" size="large"/>
    </FormItem>
  </Form>
</template>
<script>
import data from '@/store/data'
import { addPiece, updatePiece, getPiece } from '@/api/piece'
import { allAuthor, getAuthor } from '@/api/author'
export default {
  props: {
    id: {
      type: String,
      require: false
    }
  },
  data () {
    return {
      piece: {
        title: '',
        desc: '',
        author: '',
        dynasty: 0,
        content: '',
        locked: false
      },
      author: '',
      authorName: this.$str.select_tip,
      pieceValidate: {
        title: [{ required: true, message: this.$str.need_input, trigger: 'blur' }],
        author: [{ required: true, message: this.$str.need_select, trigger: 'change' }],
        dynasty: [{ required: true, type: 'number', message: this.$str.need_select, trigger: 'change' }],
      },
      cannotEdit: false,
      authorUnknown: false,
      loadingAuthor: false,
      allAuthors: [],
      authorList: [],
      categoryList: data.category,
      dynastyList: data.dynasty,
      errored: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 编辑状态下获取篇章信息
      if (this.id != '') {
        setTimeout(() => {
          getPiece({id: this.id}).then(res => {
            if (res) {
              this.piece = res
              this.allAuthors.forEach(item => {
                if (item.value == this.piece.author) {
                  if (item.label == this.$str.name_unknown) {
                    this.authorUnknown = true
                  }
                  return
                } 
              })
              if (this.piece.locked) {
                this.cannotEdit = true
              }
              this.author = this.piece.author._id
              this.authorName = this.piece.author.name.full
            }
          })
        }, 300)
      }
      // 获取作者列表以供选择
      allAuthor().then(res => {
        this.allAuthors = res.map(item =>  {
          return {
            value: item._id,
            label: item.name.full
          }
        })
      })
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
    selectedAuthor (val) {
      if (val) {
        if(val.label == this.$str.name_unknown) {
          this.authorUnknown = true
        } else {
          this.authorUnknown = false
          getAuthor({'id': this.author}).then(res => {
            this.piece.dynasty = res.dynasty
          })
        }
      }
    },
    submit () {
      this.$refs['piece'].validate((valid) => {
        if (valid) {
          this.piece.author = this.author
          this.piece.content = this.piece.content.replace(/ /g, '')
          if (this.id == '') {
            addPiece({piece: this.piece}).then(res => {
              this.$refs.piece.resetFields()
            })
          } else {
            updatePiece({piece: this.piece}).then(res => {
              this.$bus.emit('refresh')
              this.$refs.piece.resetFields()
            })
          }
          this.$Message.success(this.$str.submit + this.$str.success)
        }
      })
    }
  }
}
</script>
