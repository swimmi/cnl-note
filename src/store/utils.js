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
  const regex = new RegExp(/(。|；|？)/g)
  content = content.replace(regex, '$1_').replace(/\n/g, '')
  var array = content.split('_')
  return array
}

export default {
  functions: {
    parseNumber, parseColumn, splitToSentences
  }
}
