module.exports = {
  pairText: function (content, text) {
    const i = content.indexOf(text)
    var start = content.lastIndexOf('。', i)
    if (start == -1) {
      start = -1
    }
    var end = content.indexOf('。', i)
    if (end == -1) {
      end = content.length - 1
    }
    var str = content.substring(start + 1, end + 1).trim()
    var array = str.split(/。|？|！|；|：/)
    if (array.length > 1) {
      array.forEach(element => {
        if(element.indexOf(text) != -1 && element.indexOf('，') != -1) {
          const m = str.indexOf(element)
          str = element + str[m + element.length]
        }
      })
    }
    return str
  }
}