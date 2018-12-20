<template>
  <Form :model="relate" ref="relatePiece" :label-width="60" class="drawer-form">
    <FormItem :label="$str.src_content">
      <Input v-model="relate.srcContent" type="textarea" :autosize="{minRows: 8, maxRows: 12}" readonly></Input>
    </FormItem>
    <FormItem :label="$str.type">
      <Select v-model="relate.type" @on-change="selectType">
        <Option v-for="(item, index) in typeNames" :key="index" :value="index">{{ item }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.content">
      <Input v-model="relate.content" type="textarea" :autosize="{minRows: 12, maxRows: 15}" :placeholder="$str.input_tip" onpaste="return false;"></Input>
    </FormItem>
  </Form>
</template>
<script>
import { getPieceContent, getPiece, updatePieceRelate } from '@/api/piece'
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      relate: {
        srcContent: '',
        type: 0,
        content: '',
      },
      typeNames: ['注解', '翻译', '评论', '赏析'],
      typeContents: ['', '', '', '']
    }
  },
  mounted () {
    getPiece({id: this.id}).then(res => {
      if (res) {
        this.relate.srcContent = res.content
        res.relates.forEach(item => {
          this.typeContents[item.type] = item.getPieceContent
        })
        if (this.type) {
          this.relate.type = this.type
        }
        this.selectType(this.relate.type)
      }
    })
    this.loading = false
  },
  methods: {
    selectType (val) {
      this.relate.content = this.typeContents[val]
    },
    submit () {
      updatePieceRelate({
        id: this.id,
        type: this.relate.type,
        content: this.relate.content
      }).then(res => {
        this.$bus.emit('refresh', this.id)
        this.$bus.emit('back')
      })
      this.$Message.success(this.$str.submit_success);
    }
  }
}
</script>
<style lang="less" scoped>

</style>
