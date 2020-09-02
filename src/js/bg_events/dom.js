window.events = window.events || {};

window.events['getDropdownHTML'] = function(){
  return {
    fromLangDom: window.const.storage.fromLangDialogHTML,
    toLangDom: window.const.storage.toLangDialogHTML
  };
};

window.events['getScrollbarHTML'] = function(args){
  var r = $('<div>').append(window.handler.getLangSelectScrollbarHTML(args.type,args.filter)).html();
  return r;
};

window.events['updateCurrentLang'] = function(args){
  var type = args.type;
  var lang = args.lang;
  var recent = JSON.parse(window.const.storage.recently_used_lang);
  window.const.storage['lang_'+['from','to'][type-1]] = lang;
  if(recent.indexOf(lang) < 0 && window.const.lang.reversed[lang]){
    recent.unshift(lang);
    window.const.storage.recently_used_lang = JSON.stringify(recent);
  };
  chrome.storage.local.set(window.const.storage);

  var f = window.events['getScrollbarHTML']({type:1});
  var t = window.events['getScrollbarHTML']({type:2});

  window.handler.updateLangDialogHTML(1,true);
  window.handler.updateLangDialogHTML(2,true);

  return {
    fromScrollbarHTML: f,
    toScrollbarHTML: t
  };
};

window.events['removeRecentLang'] = function(args){
  var type = args.type;
  var lang = args.lang;
  var recent = JSON.parse(window.const.storage.recently_used_lang);
  if(recent.indexOf(lang) >= 0){
    recent.splice(recent.indexOf(lang),1);
    window.const.storage.recently_used_lang = JSON.stringify(recent);
  };
  chrome.storage.local.set(window.const.storage);
  
  window.handler.updateLangDialogHTML(1,true);
  window.handler.updateLangDialogHTML(2,true);

  return {
    fromScrollbarHTML: window.events['getScrollbarHTML']({type:1}),
    toScrollbarHTML: window.events['getScrollbarHTML']({type:2})
  };
};

window.events['getI18N'] = function(args){
  var words = args.words;
  var ret = {};

  words.forEach(function(word){
    ret[word] = window.handler.getLocale(word);
  });

  return ret;
};

window.events['getSettings'] = function(args){
  var settings = args.settings;
  var ret = {};

  settings.forEach(function(setting){
    ret[setting] = window.const.storage[setting];
  });

  return ret;
};

window.events['updateSetting'] = function(args){
  var key = args.key;
  var value = args.value;

  window.const.storage[key] = value;
  chrome.storage.local.set(window.const.storage);
};

window.events['getCurrentSDLang'] = function(){
  return {
    src: window.const.storage.lang_from,
    dist: window.const.storage.lang_to
  }
};

window.events['getTranslateResult'] = function(args, cb){
  var text = args.text;

  window.events['translate']({
    text: text
  });
  getTranslateText(
    text, 
    window.const.storage.lang_from,
    window.const.storage.lang_to,
    function(r){
      var t = r && r.data && r.data.translations && r.data.translations[0].translatedText || '';
      console.log(t);
      cb && cb(t);
    }
  )
};
