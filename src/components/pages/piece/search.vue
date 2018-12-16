<template>
  <Form ref="keywords" :model="keywords" class="drawer-form">
    <FormItem :label="$str.piece">
      <Input v-model="keywords.piece" clearable :placeholder="$str.input_tip" />
    </FormItem>
  </Form>
</template>
<script>
import { searchPiece } from '@/api/piece'
export default {
  data () {
    return {
      keywords: {
        piece: ''
      }
    }
  },
  methods: {
    reset () {
      this.keywords = {}
    },
    submit () {
      this.loading = true
      searchPiece({keyword: this.keywords.piece}).then(res => {
        this.loading = false
        this.$bus.emit('showList', $str.search_result, 'piece', res)
      })
    },
  }
}
</script>
<style lang="less" scoped>

</style>
