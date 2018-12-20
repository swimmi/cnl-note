<template>
  <Form :model="piece" :label-width="60" ref="pieceContent" class="drawer-form">
    <FormItem :label="$str.content">
      <Input v-model="piece.content" type="textarea" :autosize="{minRows: 25, maxRows: 30}" :placeholder="$str.input" @on-change="filterText" onpaste="return false;"></Input>
    </FormItem>
    <FormItem :label="$str.lock" prop="locked">
      <Switch v-model="piece.locked" size="large"/>
    </FormItem>
  </Form>
</template>
<script>
import { getPieceContent, updatePieceContent } from '@/api/piece'
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      piece: {
        content: '',
        locked: false
      }
    }
  },
  mounted () {
    getPieceContent({id: this.id}).then(res => {
      if (res) {
        this.piece.content = res.content
        this.loading = false
      }
    })
  },
  methods: {
    filterText () {
      this.piece.content = this.piece.content.replace(/[a-z]|[1-9]| /g, '')
    },
    submit () {
      updatePieceContent({
        id: this.id,
        content: this.piece.content
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
