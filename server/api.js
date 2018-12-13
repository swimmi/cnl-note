var db = require('./db')
var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var models = require('./models')

// 連接數據庫
mongoose.connect(db.mongodb)

/**
 * 篇章
 */
router.post('/piece/add', (req, res) => {
  var piece = new models.Piece(req.body.piece)
  piece.save((err, data) => {res.send(err?err:data)})
})
router.post('/piece/update', (req, res) => {
  const piece = new models.Piece(req.body.piece)
  models.Piece.findByIdAndUpdate(piece._id, {
    'title': piece.title,
    'desc': piece.desc,
    'author': piece.author,
    'period': piece.period,
    'content': piece.content,
    'locked': piece.locked
  }, (err, data) => {res.send(err?err:data)})
})
router.post('/piece/get', (req, res) => {
  models.Piece.
    findById(req.body.id).
    populate({path: 'author', select: 'name.full'}).
    exec((err, data) => {res.send(err?err:data)})
})
router.get('/piece/all', (req, res) => {
  models.Piece.find((err, data) => {res.send(err?err:data)})
})
router.post('/piece/search', (req, res) => {
  const key = req.body.keyword
  const reg = new RegExp(key)
  models.Piece.
    find({$and: [{title: {$regex: reg}}]}).
    populate({path: 'author', select: 'name.full'}).
    sort({'updatedAt': -1}).
    exec((err, data) => {res.send(err?err:data)})
})
router.post('/piece/random', (req, res) => {
  var size = 1
  if (req.body.size) {
    size = parseInt(req.body.size)
  }
  models.Piece.
    aggregate([{$sample: {'size': size}}]).
    exec((err, data) => {
      models.Piece.populate(data, 
        {path: 'author', select: 'name.full'},
        (err,data) => {
          res.send(err?err:data)
        }
      )
    })
})
// 篇章内容
router.post('/piece/content/get', (req, res) => {
  const id = req.body.id
  models.Piece.findById(id, {'content': 1}, (err, data) => {res.send(err?err:data)})
})
router.post('/piece/content/update', (req, res) => {
  const id = req.body.id
  const content = req.body.content
  models.Piece.update({_id: id}, {$set: {'content': content}}, (err, data) => {res.send(err?err:data)})
})
// 篇章相关
router.post('/piece/relate/update', (req, res) => {
  const id = req.body.id
  const type = req.body.type
  const content = req.body.content
  models.Piece.update({_id: id}, {$pull: {'relates': {'type': type}}}, () => {
    models.Piece.update({_id: id}, {$push: {'relates': {'type': type, 'content': content}}}, (err, data) => {res.send(err?err:data)})
  })
})
// 篇章书签
router.post('/piece/bookmark/add', (req, res) => {
  const id = req.body.id
  const bookmark = req.body.bookmark
  models.Piece.update({_id: id}, {$push: {'bookmarks': bookmark}}, (err, data) => {res.send(err?err:data)})
})
router.post('/piece/bookmark/remove', (req, res) => {
  const id = req.body.id
  const col = req.body.col
  models.Piece.update({_id: id}, {$pull: {bookmarks: {col: col}}} , (err, data) => {res.send(err?err:data)})
})
// 篇章浏览记录
router.post('/piece/view/record', (req, res) => {
  models.Piece.findByIdAndUpdate(req.body.id, {$set: {'lastViewAt': Date.now()}}, (err, data) => {res.send(err?err:data)})
})
// 最近篇章
router.post('/piece/recent', (req, res) => {
  const type = req.body.type
  switch (type) {
    case 0:
      models.Piece.
        find({'lastViewAt': { $exists: true }}).
        populate({path: 'author', select: 'name.full'}).
        sort({'lastViewAt': -1}).
        exec((err, data) => {res.send(err?err:data)})
      break
    case 1:
      models.Piece.
        find({'createdAt': { $exists: true }}).
        populate({path: 'author', select: 'name.full'}).
        sort({'createdAt': -1}).
        exec((err, data) => {res.send(err?err:data)})
      break;
  }
})

/**
 * 作者
 */
router.post('/author/add', (req, res) => {
  var author = new models.Author(req.body.author)
  author.save((err, data) => {res.send(err?err:data)})
})
router.get('/author/all', (req, res) => {
  models.Author.find((err, data) => {res.send(err?err:data)})
})
router.post('/author/dynasty', (req, res) => {
  models.Author.find({'dynasty': req.body.dynasty}, (err, data) => {res.send(err?err:data)})
})

/**
 * 书籍
 */
router.post('/book/add', (req, res) => {
  var book = new models.Book(req.body.book)
  book.save((err, data) => {res.send(err?err:data)})
})
router.get('/book/all', (req, res) => {
  models.Book.find((err, data) => {res.send(err?err:data)})
})
router.post('/book/category', (req, res) => {
  models.Book.find({'category': req.body.category}, (err, data) => {res.send(err?err:data)})
})

/**
 * 通用
 */
// Util
router.get('/util/dashboard', async (req, res) => {
  var counts = [0, 0, 0]
  await models.Author.count((err, data) => {
    if(!err) { counts[0] = data }
  })
  await models.Piece.count((err, data) => {
    if(!err) { counts[1] = data }
  })
  await models.Piece.find({}, {content: 1}, (err, data) => {
    if(!err) { 
      counts[2] = data.reduce(function (total, item) {
        return total + item.content.length
      }, 0)
    }
  })
  res.send(counts)
})

module.exports = router