<template>
  <Spin v-if="loading" class="center-parent"></Spin>
  <Form v-else :model="piece" :rules="pieceValidate" :label-width="60" ref="piece" class="drawer-form">
    <FormItem :label="$str.title" prop="title">
      <Input v-model="piece.title" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.title_desc" prop="desc">
        <Input v-model="piece.desc" type="textarea" :autosize="{minRows: 3}" :placeholder="$str.input_tip"></Input>
    </FormItem>
    <FormItem :label="$str.author">
      <Select
        v-model="piece.author"
        filterable
        remote
        label-in-value
        @on-change="selectedAuthor"
        :remote-method="queryAuthors"
        :loading="loadingAuthor">
        <Option v-for="(item, index) in authorList" :value="item.value" :key="index">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem v-if="authorUnknown" :label="$str.period">
      <Select v-model="piece.period">
        <Option
          v-for="(item, index) in dynastyList"
          :key="index"
          :value="item.id">{{ item.title }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.content" prop="content">
        <Input v-model="piece.content" type="textarea" :autosize="{minRows: 8, maxRows: 12}" :placeholder="$str.input_tip" onpaste="return false;"></Input>
    </FormItem>
    <FormItem :label="$str.lock" prop="locked">
      <Switch v-model="piece.locked" size="large"/>
    </FormItem>
    <FormItem>
        <Button type="primary" @click="submit" :disabled="cannotEdit">{{ cannotEdit ? $str.locked : $str.submit }}</Button>
        <Button style="margin-left: 8px" @click="$bus.emit('back')">{{ $str.back }}</Button>
    </FormItem>
  </Form>
</template>
<script>
import data from '@/store/data'
import { addPiece, updatePiece, getPiece } from '@/api/piece'
import { allAuthor } from '@/api/author'
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
        period: '',
        content: '',
        locked: false
      },
      pieceValidate: {
        title: [{ required: true, message: this.$str.need_input, trigger: 'blur' }],
        author: [{ required: true, message: this.$str.need_select, trigger: 'change' }],
        period: [{ required: true, type: 'number', message: this.$str.need_select, trigger: 'change' }],
      },
      cannotEdit: false,
      authorUnknown: false,
      loadingAuthor: false,
      allAuthors: [],
      authorList: [],
      dynastyList: data.dynasty,
      errored: false,
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
              this.loading = false
            }
          })
        }, 300)
      }
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
        }
      }
    },
    submit () {
      this.$refs['piece'].validate((valid) => {
        if (valid) {
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
          this.$Message.success(this.$str.submit_success)
        }
      })
    }
  }
}
</script>
