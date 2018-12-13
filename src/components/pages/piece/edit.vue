<template>
  <Form :model="piece" ref="pieceContent" class="drawer-form">
    <FormItem>
      <Input v-model="piece.content" type="textarea" :autosize="{minRows: 25}" :placeholder="$str.input" onpaste="return false;"></Input>
    </FormItem>
    <FormItem :label="$str.lock" prop="locked">
      <Switch v-model="piece.locked" size="large"/>
    </FormItem>
    <FormItem>
      <Button type="primary" :loading="submitting" @click="submit">
        <span v-if="!submitting">{{ $str.submit }}</span>
        <span v-else>{{ $str.wait }}</span>
      </Button>
      <Button style="margin-left: 8px" @click="$bus.emit('back')">{{ $str.back }}</Button>
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
      },
      submitting: false
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
    submit () {
      this.submitting = true
      updatePieceContent({
        id: this.id,
        content: this.piece.content
      }).then(res => {
        this.submitting = false
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
