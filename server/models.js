var mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

// 篇章
const pieceSchema = Schema({
  title: String,                              // 标题
  desc: String,                               // 题记
  author: { type: ObjectId, ref: 'Author' },  // 作者
  dynasty: Number,                            // 作者佚名时可作区分
  category: Number,                           // 分类
  content: String,                            // 内容
  locked: { type: Boolean, default: false },  // 是否锁定
  relates: [],                                // 相关内容
  records: [],                                // 朗读音频文件
  marks: [                                    // 批注
    {
      text: { type: String },
      index: { type: Number },
      desc: { type: String }
    }
  ],
  number: {
    time: { type: Number, default: 0 },       // 阅读次数
    duration: { type: Number, default: 0 }    // 阅读时长，分钟
  },
  status: {
    understand: { type: Boolean, default: false },    // 已理解
    recite: { type: Boolean, default: false },        // 可背诵
    favorite: { type: Boolean, default: false }       // 是喜欢
  },
  hidden: { type: Boolean, default: false },
  lastViewAt: Date                            // 上次浏览
}, {collection: 'pieces', timestamps: true})
pieceSchema.pre('find', function(next) {
  this.populate('author', 'name.full')
  next()
})

// 作者
const authorSchema = Schema({
  type: Number,           // 类型 个人 or 群体
  name: {                 // 名称
    xing: String,         // 姓
    ming: String,         // 名
    zi: String,           // 字
    hao: String,          // 号
    full: String          // 全名 群体只有该字段
  },
  dynasty: Number,        // 朝代
  native_place: String,    // 籍贯
  years: {                // 生卒年
    birth: { type: Number },
    death: { type: Number }
  },
  tags: [String],         // 标签
  introduce: String,      // 介绍
  hidden: { type: Boolean, default: false }
}, {collection: 'authors', timestamps: true})

// 书籍
const bookSchema = Schema({
  title: String,
  alias: String,
  category: Number,
  author: { type: ObjectId, ref: 'Author' },
  dynasty: Number,
  tags: [String],
  prologue: String,
  introduce: String,
  bookmarks: [
    {
      page: { type: Number },
      col: { type: Number },
      text: { type: String },
      type: { type: Number }
    }
  ],
  catalog: [
    {
      title: String,
      show_desc: Boolean,
      desc: String,
      children: [{
        children: [{
          pieces: [{ type: ObjectId, ref: 'Piece' }]
        }],
        pieces: [{ type: ObjectId, ref: 'Piece' }]
      }],
      pieces: [{ type: ObjectId, ref: 'Piece' }]
    }
  ],
  number: {
    time: { type: Number, default: 0 },       // 阅读次数
    duration: { type: Number, default: 0 }    // 阅读时长，分钟
  },
  hidden: { type: Boolean, default: false },
  lastViewAt: Date
}, {collection: 'books', timestamps: true})
bookSchema.pre('find', function(next) {
  this.populate('author', 'name.full')
  next()
})

const models = {
  Piece: mongoose.model('Piece', pieceSchema),
  Author: mongoose.model('Author', authorSchema),
  Book: mongoose.model('Book', bookSchema)
}

module.exports = models