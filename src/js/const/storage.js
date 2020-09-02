(function(){
  window.const = window.const || {};

  var browserLang = getBrowserLang();
  window.const.storage = {
    lang_from: 'auto',
    lang_to: browserLang,
    // 0: 正常；1：暗色
    night_mode: 0,
    recently_used_lang: JSON.stringify(['auto',browserLang]),
    fromLangDialogHTML: '',
    toLangDialogHTML: ''
  };

  function getBrowserLang(){
    var lang = navigator.language || navigator.languages[0];
    if(window.const.lang.reversed[lang]){
      return lang;
    }else{
      return 'en';
    };
  };
})();
