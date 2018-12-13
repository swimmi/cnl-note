<template>
  <Form ref="keywords" :model="keywords" :label-width="40" class="drawer-form">
    <FormItem :label="$str.piece">
      <Input v-model="keywords.piece" clearable :placeholder="$str.input_tip" />
    </FormItem>
    <FormItem>
      <Button type="primary" @click="search">{{ $str.search }}</Button>
      <Button @click="reset">{{ $str.reset }}</Button>
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
    search () {
      this.loading = true
      searchPiece({keyword: this.keywords.piece}).then(res => {
        var result = res
        this.loading = false
        this.$emit('result', 'Search', result)
      })
    },
  }
}
</script>
<style lang="less" scoped>

</style>
