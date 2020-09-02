window.handler = window.handler || {};

window.handler.isCurrent = function(lang, type){
  return (type==1 && window.const.storage['lang_from'] == lang) || (type==2 && window.const.storage['lang_to'] == lang);
};

window.handler.isRencent = function(lang, recent){
  return recent.indexOf(lang) > -1;
};

window.handler.getLocale = function(){
  var message = chrome.i18n.getMessage.apply(chrome, arguments);
  return message;
};

window.handler.getRecentLangs = function(type, filter){
  var history, recent = [];
  try{
    history = JSON.parse(window.const.storage['recently_used_lang']);
  }catch(e){
    history = [];
  };
  history.forEach(function(lang){
    if(type == 2 && lang == 'auto') return;
    var key = window.const.lang.reversed[lang];
    var i18n = window.handler.getLocale('Kernel_Lang_'+window.const.lang.reversed[lang]);
    if(filter && i18n.indexOf(filter) < 0) return;
    if(filter && filter.length > 0) i18n = i18n.replace(filter,'<span class="blue">'+filter+'</span>');
    recent.push({
      key: key,
      value: lang,
      i18n: i18n
    });
  });
  return recent;
};

window.handler.getAllLangs = function(type, filter){
  var langs = window.const.lang.list || {};
  var ordered = [], current, auto;
  var recent = window.handler.getRecentLangs(type);
  Object.keys(langs).forEach(function(key){
    var i18n = window.handler.getLocale('Kernel_Lang_'+key);
    var o = {
      key: key,
      value: langs[key],
      i18n: i18n
    };
    if(window.handler.isCurrent(langs[key],type)){
      current = o;
    };
    if(filter && i18n.indexOf(filter) < 0) return;
    if(filter && filter.length > 0) o.i18n = i18n.replace(filter,'<span class="blue">'+filter+'</span>');
    if(window.handler.isRencent(langs[key],recent)){
      return;
    }else{
      if(key == 'Auto'){
        auto = o;
        return;
      };
      ordered.push(o);
    };
  });
  ordered.sort(function(a,b){
    if (a.key < b.key) {
        return -1;
    } else if (a.key > b.key) {
        return 1;
    };

    return 0;
  });
  if(auto && type == 1){
    ordered.unshift(auto);
  };
  return {
    current: current,
    all: ordered
  }
};

