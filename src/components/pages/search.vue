<template>
  <Form ref="form" :model="form" class="drawer-form">
    <FormItem>
      <Input v-model="form.keyword" clearable :placeholder="$str.input_tip" />
    </FormItem>
  </Form>
</template>
<script>
import { searchPiece } from '@/api/piece'
import { searchBook } from '@/api/book'
export default {
  data () {
    return {
      form: {
        keyword: ''
      }
    }
  },
  methods: {
    reset () {
      this.keyword = {}
    },
    submit () {
      const params = {
        keyword: this.form.keyword
      }
      this.$bus.emit('showList', this.$str.search_result, 'search-items', params)
      this.$bus.emit('back')
    },
  }
}
</script>
<style lang="less" scoped>

</style>
