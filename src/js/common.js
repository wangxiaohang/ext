function getTranslateWord(word,lang_from,lang_to,cb){
  lang_from = lang_from.indexOf('-')>-1? lang_from.split('-')[0]:lang_from;
  lang_to = lang_to.indexOf('-')>-1?lang_to.split('-')[0]:lang_to;
  var lang = lang_from.toLowerCase()+'-'+lang_to.toLowerCase();
  $.get(
    window.const.api.translate.word.url+'?'+
    window.const.api.translate.word.txtKey+'='+word+'&'+
    window.const.api.translate.word.langKey+'='+lang,
    function(re){
      var res = re.replace(/\n/g,"\\n").replace(/\r/g,"\\r");
      var r = JSON.parse(res);
      console.log('word translate result:');
      console.log(r);
      cb && cb(r);
    }
  ).error(function(e){
    console.log(e);
    cb && cb();
  });
};

function getTranslateText(text,lang_from,lang_to,cb){
  lang_from = lang_from.indexOf('-')>-1? lang_from.split('-')[0]:lang_from;
  lang_to = lang_to.indexOf('-')>-1?lang_to.split('-')[0]:lang_to;
  var lang = lang_from.toLowerCase()+'-'+lang_to.toLowerCase();
  var t = encodeURIComponent(text);
  $.get(
    window.const.api.translate.text.url+'?'+
    window.const.api.translate.text.txtKey+'='+t+'&'+
    window.const.api.translate.text.langKey+'='+lang,
    function(re){
      var res = re.replace(/\n/g,"\\n").replace(/\r/g,"\\r");
      var r = JSON.parse(res);
      console.log(r);
      cb && cb(r);
    }
  );
};

function getTime(time){
  var d = new Date(time);
  var year = d.getFullYear();
  var m = d.getMonth() - 0 + 1;
  var month = m < 10 ? '0'+m : m;
  var da = d.getDate();
  var date = da < 10 ? '0'+da: da;
  var h = d.getHours();
  var hour = h<10?'0'+h:h;
  var mi = d.getMinutes();
  var minute = mi<10?'0'+mi:mi;
  var s = d.getSeconds();
  var second = s<10?'0'+s:s;
  return year+'.'+month+'.'+date+' '+hour+':'+minute+':'+second;
};

function selectOption(parent, option){
  parent.removeClass('pop');
  parent.find('.selection-show').html(option.html());
  option.addClass('active').siblings().removeClass('active');
};
