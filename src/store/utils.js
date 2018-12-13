// 将数字转换为汉字
var parseNumber = function (num) {
  let changeNum = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  let unit = ["", "十", "百", "千", "万"]
  num = parseInt(num)
  let getWan = (temp) => {
  let strArr = temp.toString().split("").reverse()
  let newNum = ""
  for (var i = 0; i < strArr.length; i++) {
    newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum
  }
   return newNum
 }
 let overWan = Math.floor(num / 10000)
 let noWan = num % 10000
 if (noWan.toString().length < 4) noWan = "0" + noWan
 return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num)
}

var parseColumn = function (content) {
  var c = content.replace(/(，|。|、|：|；|！|？|“|”)/g, ' $1')
  c = c.replace('《', ' ︽ ')
  c = c.replace('》', ' ︾ ')
  c = c.replace('（', ' ︵ ')
  c = c.replace('）', ' ︶ ')
  c = c.replace('“', ' ﹃ ')
  c = c.replace('”', ' ﹄ ')
  c = c.replace('‘', ' ﹁ ')
  c = c.replace('’', ' ﹂ ')
  return c
}

export default {
  functions: {
    parseNumber, parseColumn
  }
}
