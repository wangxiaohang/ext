window.const = window.const || {};

window.const.api = {
  translate: {
    text: {
      url: 'https://masterbrowser.me/v2/text/translate',
      txtKey: 'text',
      langKey: 'language'
    },
    word: {
      url: 'https://masterbrowser.me/v2/word/translate',
      txtKey: 'name',
      langKey: 'language'
    },
    href: {
      self: 'https://masterbrowser.me/word/translate?name=<%text%>&language=<%fromLang%>-<%toLang%>',
      google: 'https://translate.google.cn/#view=home&op=translate&sl=<%fromLang%>&tl=<%toLang%>&text=<%text%>',
      baidu: 'https://fanyi.baidu.com/?aldtype=16047#<%fromLang%>/<%toLang%>/<%text%>',
      yandex: 'https://translate.yandex.com/?lang=<%fromLang%>-<%toLang%>&text=<%text%>'
    }
  }
};