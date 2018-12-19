// 将数字转换为汉字
var parseNumber = function (num) {
    const units = '个十百千万@#%亿^&~'
    const chars = '零一二三四五六七八九'
    var a=(num+'').split(''),s=[]
    if(a.length>12){
      throw new Error('too big')
    }else{
      for(var i=0,j=a.length-1;i<=j;i++){
        if(j==1||j==5||j==9){
          if(i==0){
              if(a[i]!='1')s.push(chars.charAt(a[i]))
          }else{
              s.push(chars.charAt(a[i]))
          }
        }else{
          s.push(chars.charAt(a[i]))
        }
        if(i!=j){
          s.push(units.charAt(j-i))
        }
      }
    }
    //return s;
    return s.join('').replace(/零([十百千万亿@#%^&~])/g,function(m,d,b){
      b=units.indexOf(d);
      if(b!=-1){
        if(d=='亿')return d;
        if(d=='万')return d;
        if(a[j-b]=='0')return '零'
      }
      return '';
    }).replace(/零+/g,'零').replace(/零([万亿])/g,function(m,b){
      return b;
    }).replace(/亿[万千百]/g,'亿').replace(/[零]$/,'').replace(/[@#%^&~]/g,function(m){
      return {'@':'十','#':'百','%':'千','^':'十','&':'百','~':'千'}[m];
    }).replace(/([亿万])([一-九])/g,function(m,d,b,c){
      c=units.indexOf(d)
      if(c!=-1){
          if(a[j-c]=='0')return d+'零'+b
      }
      return m
  });
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

var splitToSentences = function (content) {
  const regex = new RegExp(/(。|；|？|！)/g)
  content = content.replace(regex, '$1 ').replace(/\n/g, '').trim()
  var array = content.split(' ')
  if (content.split(/？|！|；/).length > 0) {
    for (var i = 0; i < array.length; i++) {
      const item = array[i]
      if (/^[\u4e00-\u9fa5]+[？|！|；]/.test(item)) {
        if (i < array.length - 1) {
          array.splice(i, 1)
          array[i] = item + array[i]
        }
      }
    }
  }
  return array
}

var textMatch = function (text1, text2) {
  const regex = new RegExp(/[^\u4e00-\u9fa5]/g)
  var str1 = text1.replace(regex, '').trim()
  var str2 = text2.replace(regex, '').trim()
  if (str1 == str2) {
    return true
  }
  return false
}

var getTimeStr = function () {
  const str = '子丑寅卯辰巳午未申酉戌亥'
  const time = new Date()
  var h = time.getHours() + 1
  if (h == 24) {
    h = 0
  }
  const ch = str.charAt(Math.floor(h / 2))
  const m = time.getMinutes()
  var cm = Math.ceil(m / 15)
  if (h % 2 == 1) {
    cm += 4
  }
  return `${ch}时${parseNumber(cm)}刻`
}

var uploadPath = 'http://localhost:8080/api/'

export default {
  functions: {
    parseNumber, parseColumn, splitToSentences, getTimeStr, textMatch, uploadPath
  }
}
