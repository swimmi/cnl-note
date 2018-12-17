var db = require('./db')
var utils = require('./utils')
var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var models = require('./models')
var fileUpload = require('express-fileupload')
router.use(fileUpload({createParentPath: true}))

// 連接數據庫
mongoose.connect(db.mongodb, {useNewUrlParser: true})

/**
 * 篇章
 */
router.post('/piece/add', (req, res) => {
  var piece = new models.Piece(req.body.piece)
  piece.save((err, data) => {res.send(err?err:data)})
})
router.post('/piece/update', (req, res) => {
  const piece = new models.Piece(req.body.piece)
  models.Piece.updateOne({_id: piece._id}, {
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
  models.Piece.find({}).select('_id title').exec((err, data) => {res.send(err?err:data)})
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
router.post('/piece/author', (req, res) => {
  const author = req.body.author
  const period = req.body.dynasty
  models.Piece.find({'author': author, 'period': period}, (err, data) => {res.send(err?err:data)})
})
router.post('/piece/category', (req, res) => {
  const category = req.body.category
  models.Piece.find({'category': category}, (err, data) => {res.send(err?err:data)})
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
  models.Piece.updateOne({_id: id}, {$set: {'content': content}}, (err, data) => {res.send(err?err:data)})
})
// 篇章相关
router.post('/piece/relate/update', (req, res) => {
  const id = req.body.id
  const type = req.body.type
  const content = req.body.content
  models.Piece.updateOne({_id: id}, {$pull: {'relates': {'type': type}}}, () => {
    models.Piece.updateOne({_id: id}, {$push: {'relates': {'type': type, 'content': content}}}, (err, data) => {res.send(err?err:data)})
  })
})
// 篇章书签
router.post('/piece/bookmark/add', (req, res) => {
  const id = req.body.id
  const bookmark = req.body.bookmark
  models.Piece.updateOne({_id: id}, {$push: {'bookmarks': bookmark}}, (err, data) => {res.send(err?err:data)})
})
router.post('/piece/bookmark/remove', (req, res) => {
  const id = req.body.id
  const col = req.body.col
  models.Piece.updateOne({_id: id}, {$pull: {bookmarks: {col: col}}} , (err, data) => {res.send(err?err:data)})
})
// 篇章浏览记录
router.post('/piece/history/save', (req, res) => {
  const id = req.body.id
  models.Piece.updateOne({_id: id}, {$set: {'lastViewAt': Date.now()}}, (err, data) => {res.send(err?err:data)})
})
// 最近篇章
router.post('/piece/recent', (req, res) => {
  const page = req.body.page || 0
  const limit = req.body.limit || 10
  const orderBy = req.body.orderBy || 'create'
  switch (orderBy) {
    case 'view':
      models.Piece.
        find({'lastViewAt': { $exists: true }}).
        populate({path: 'author', select: 'name.full'}).
        sort({'lastViewAt': -1}).
        skip(page * limit).
        limit(limit).
        exec((err, data) => {res.send(err?err:data)})
      break
    case 'create':
      models.Piece.
        find({'createdAt': { $exists: true }}).
        populate({path: 'author', select: 'name.full'}).
        sort({'createdAt': -1}).
        skip(page * limit).
        limit(limit).
        exec((err, data) => {res.send(err?err:data)})
      break;
  }
})
// 篇章朗读
router.post('/piece/record/upload', (req, res) => {

})

/**
 * 作者
 */
router.post('/author/get', (req, res) => {
  const id = req.body.id
  models.Author.findById(id, (err, data) => {res.send(err?err:data)})
})
router.post('/author/add', (req, res) => {
  var author = new models.Author(req.body.author)
  author.save((err, data) => {res.send(err?err:data)})
})
router.get('/author/all', (req, res) => {
  models.Author.find({}).select('_id name').exec((err, data) => {res.send(err?err:data)})
})
router.post('/author/dynasty', (req, res) => {
  models.Author.
    find({'dynasty': {$in: [req.body.dynasty, 0]}}).
    sort({'dynasty': -1, 'years.birth': 1}).
    exec((err, data) => {res.send(err?err:data)})
})

/**
 * 书籍
 */
router.post('/book/add', (req, res) => {
  var book = new models.Book(req.body.book)
  book.save((err, data) => {res.send(err?err:data)})
})
router.post('/book/get', (req, res) => {
  const id = req.body.id
  models.Book.findById(id, (err, data) => {res.send(err?err:data)})
})
router.get('/book/all', (req, res) => {
  models.Book.find({}).select('_id title').exec((err, data) => {res.send(err?err:data)})
})
router.post('/book/search', (req, res) => {
  const key = req.body.keyword
  const reg = new RegExp(key)
  models.Book.
    find({$and: [{title: {$regex: reg}}]}).
    populate({path: 'author', select: 'name.full'}).
    sort({'updatedAt': -1}).
    exec((err, data) => {res.send(err?err:data)})
})
router.post('/book/catalog/get', (req, res) => {
  const id = req.body.book
  models.Book.findById(id, {'catalog': 1}, (err, data) => {res.send(err?err:data)})
})
router.post('/book/catalog/update', (req, res) => {
  const id = req.body.book
  const catalog = req.body.catalog
  models.Book.updateOne({_id: id}, {$set: {'catalog': catalog}}, (err, data) => {res.send(err?err:data)})
})
router.post('/book/content', (req, res) => {
  const id = req.body.book
  models.Book.
    findById(id).
    select('title author prologue catalog').
    populate('catalog.pieces catalog.children.pieces catalog.children.children.pieces', 'title desc content').
    populate('author', 'name.full').
    exec((err, data) => {res.send(err?err:data)})
})
router.post('/book/author', (req, res) => {
  const author = req.body.author
  const dynasty = req.body.dynasty
  models.Book.find({'author': author, 'dynasty': dynasty}, (err, data) => {res.send(err?err:data)})
})
router.post('/book/category', (req, res) => {
  const category = req.body.category
  models.Book.find({'category': category}, (err, data) => {res.send(err?err:data)})
})
router.post('/book/recent', (req, res) => {
  const orderBy = req.body.orderBy || 'create'
  switch (orderBy) {
    case 'view':
      models.Book.
        find({'lastViewAt': { $exists: true }}).
        populate({path: 'author', select: 'name.full'}).
        sort({'lastViewAt': -1}).
        exec((err, data) => {res.send(err?err:data)})
      break
    case 'create':
      models.Book.
        find({'createdAt': { $exists: true }}).
        populate({path: 'author', select: 'name.full'}).
        sort({'createdAt': -1}).
        exec((err, data) => {res.send(err?err:data)})
      break;
  }
})
router.post('/book/history/save', (req, res) => {
  const id = req.body.id
  models.Book.updateOne({_id: id}, {$set: {'lastViewAt': Date.now()}}, (err, data) => {res.send(err?err:data)})
})

/**
 * 通用
 */
// Util
router.get('/util/dashboard', async (req, res) => {
  var counts = [0, 0, 0]
  await models.Author.countDocuments((err, data) => {
    if(!err) { counts[0] = data }
  })
  await models.Piece.countDocuments((err, data) => {
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
router.post('/util/pairtext', function(req, res) {
  var text = req.body.text
  const reg = new RegExp(text)
  models.Piece.
    findOne({content: {$regex: reg}}).
    exec((err, data) => {
      if (data) {
        const content = data.content
        const str = utils.pairText(content, text)
        res.send(err?err:str)
      } else {
        res.send(err?err:'')
      }
    })
})

router.get('/:dir/:id/:name', function(req, res) {
  var dir = req.params.dir
  var id = req.params.id
  var options = {
    root: __dirname + `/uploads/${dir}/${id}/`,
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  }
  var name = req.params.name
  res.sendFile(name, options, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('Sent:', name)
    }
  })
  console.log(__dirname)
})
router.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.')
  }
  let file = req.files.file
  const id = req.body.id
  file.mv(`uploads/records/${id}/` + file.name, function(err) {
    if (err)
      return res.status(500).send(err)
    res.send('File uploaded!')
  })
})

module.exports = router