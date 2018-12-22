<template>
  <Form :model="author" :label-width="60" ref="author" class="drawer-form">
    <FormItem :label="$str.type">
      <RadioGroup v-model="typeText" @on-change="changeType">
        <Radio label="person">{{ $str.person }}</Radio>
        <Radio label="group">{{ $str.group }}</Radio>
      </RadioGroup>
    </FormItem>
    <FormItem :label="$str.name">
      <Input v-model="author.name.full"></Input>
    </FormItem>
    <section v-if="author.type == 1">
      <FormItem :label="$str.name_xing">
        <Input v-model="author.name.xing"></Input>
      </FormItem>
      <FormItem :label="$str.name_ming">
        <Input v-model="author.name.ming"></Input>
      </FormItem>
      <FormItem :label="$str.name_zi">
        <Input v-model="author.name.zi"></Input>
      </FormItem>
      <FormItem :label="$str.name_hao">
        <Input v-model="author.name.hao"></Input>
      </FormItem>
      <FormItem :label="$str.birth_death">
        <Switch v-model="hasBirthYear"><span slot="open">{{ $str.birth_death[0] }}</span><span slot="close">{{ $str.no }}</span></Switch>
        <InputNumber :max="2000" :min="-3000" v-model="author.years.birth" :disabled="!hasBirthYear" :style="{width: '60px'}"></InputNumber>&nbsp;&nbsp;
        <Switch v-model="hasDeathYear"><span slot="open">{{ $str.birth_death[1] }}</span><span slot="close">{{ $str.no }}</span></Switch>
        <InputNumber :max="2000" :min="-3000" v-model="author.years.death" :disabled="!hasDeathYear" :style="{width: '60px'}"></InputNumber>
      </FormItem>
      <FormItem :label="$str.native_place">
        <Input v-model="author.native_place"></Input>
      </FormItem>
    </section>
    <FormItem :label="$str.dynasty">
      <Select v-model="author.dynasty">
        <Option
          v-for="(item, index) in dynastyList"
          :key="index"
          :value="item.id">{{ item.title }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="$str.tag">
      <Input v-model="tagText" style="width: 120px" />
      <Button icon="ios-add" type="dashed" @click="handleAdd"></Button><Br />
      <Tag v-for="item in author.tags" :key="item" :name="item" closable @on-close="handleClose">{{ item }}</Tag>
    </FormItem>
    <FormItem :label="$str.introduce">
        <Input v-model="author.introduce" type="textarea" :autosize="{minRows: 5,maxRows: 8}"></Input>
    </FormItem>
  </Form>
</template>
<script>
import data from '@/store/data'
import { addAuthor } from '@/api/author'
export default {
  data () {
    return {
      author: {
        type: 1,
        name: {
          xing: '',
          ming: '',
          zi: '',
          hao: '',
          full: ''
        },
        dynasty: 0,
        native_place: '',
        years: {
          birth: 0,
          death: 0
        },
        tags: [],
        introduce: ''
      },
      typeText: 'person',
      hasBirthYear: false,
      hasDeathYear: false,
      tagText: '',
      dynastyList: data.dynasty
    }
  },
  methods: {
    handleAdd () {
      if (this.tagText.trim().length) {
        this.author.tags.push(this.tagText)
        this.tagText = ''
      }
    },
    handleClose (event, name) {
      const index = this.author.tags.indexOf(name)
      this.author.tags.splice(index, 1)
    },
    changeType: function (value) {
      if (value === 'person') {
        this.author.type = 1
      } else {
        this.author.type = 2
      }
    },
    submit () {
      if (!this.hasBirthYear) {
        this.author.years.birth = null
      }
      if (!this.hasDeathYear) {
        this.author.years.death = null
      }
      if (this.author.name.full === '') {
        this.author.name.full = this.author.name.xing + this.author.name.ming
      }
      addAuthor({author: this.author}).then(res => {
        this.$Message.success(this.$str.submit + this.$str.success)
        this.$bus.emit('back')
      })
    }
  }
}
</script>
