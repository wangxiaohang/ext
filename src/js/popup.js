$(function(){
    if(location.hash == '#solo') $('#unpin-btn').remove();

    // toggle tab
    $('.tab-header').click(function(e){
        $(this).parent('.tab').addClass('active').siblings().removeClass('active');
    });

    // toggle menu
    $('.menu-icon').click(function(){
        $('.menu').toggleClass('display');
    });
    
    $('#unpin-btn').click(function(){
       //window.open(chrome.extension.getURL('pages/unpin.html'),)
       //chrome.tabs.create({url: chrome.extension.getURL('pages/unpin.html'),active:true});
       
        let window_options = {
            // url: chrome.extension.getURL('pages/unpin.html'),
            url: chrome.extension.getURL('pages/popup.html#solo'),
            left: 300,
            top: 100,
            width: 560,
            height: 440,
            type: 'popup' 
        };
         
        chrome.windows.create(window_options, function(window){
          console.log('new window id: '+window.id);
        });
    });
    
    $('#manage-vocabulary-list-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/manage-vocabulary-list.html')});
    });
    
    $('#set-default-vocabulary-list-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/set-default-vocabulary-list.html')});
    });
    
    $('#manage-translation-list-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/manage-translation-list.html')});
    });
    
    $('#dictionary-history-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/dictionary-history.html')});
    });
    
    $('#translation-history-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/translation-history.html')});
    });
    
    $('#night-mode-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/night-mode.html')});
    });
    
    $('#setting-btn').click(function(){
       chrome.tabs.create({url: chrome.extension.getURL('pages/setting.html')});
    });
});

$(function(){
  var textarea = $('#translation-source');
  var translateArea = $('#translation-target');

  initUI();
  initDropdown();
  addTranslationListener();
  addDictionaryListener();

  function initUI(){
    var settings = ['night_mode'];

    chrome.runtime.sendMessage({
      message: 'getSettings',
      args: JSON.stringify({
        settings: settings
      })
    },function(r){
      if(r[settings[0]] == 1){
        $('body').addClass('night-mode');
      };
    });
  };

  function addTranslationListener(){
    $('#translation-container .tab-content').click(function(e){
      var that = $(e.target);
      if(that.hasClass('lang-show') || that.hasClass('dialog-show')){
        toggleLangSelectBox(e.target);
      }else if(that.attr('id') == 'translation-btn'){
        translateHandler();
      }else if(that.hasClass('select-lang')){
        selectLang(that);
      }else if(that.hasClass('close-recent')){
        removeRecentLang(that);
      }else if(that.hasClass('tool-icon') && that.hasClass('clear')){
         textarea.val('');
         translateArea.html('');
         translateArea.removeClass('loading');
      };
    }).keyup(function(e){
      var that = $(e.target);
      translateArea.removeClass('loading');
      if(that.attr('id') == 'translation-source'){
        // text area
        if(that.val().length <= 0){
          $('#translation-btn').addClass('none');
          $('.tool-icon.clear').addClass('none');
        }else{
          $('#translation-btn').removeClass('none');
          $('.tool-icon.clear').removeClass('none');
        };

        if(e.keyCode == 13){
          translateHandler();
        };
      }else if(that.attr('id').indexOf('-lang-search') >= 0){
        var type = that.attr('id') == 'src-lang-search' ? 1:2;
        updateLangScrollbar(that,type);
      };
    });

    textarea.focus(function(e){
      $('.lang-header').removeClass('display');
    });

    function translateHandler(){
      translateArea.addClass('loading');
      var text = textarea.val(),
          fromLang = $('#translation-container .src-lang button.lang-show').attr('data-lang'),
          toLang = $('#translation-container .dist-lang button.lang-show').attr('data-lang');
      getTranslateText(
        text,
        fromLang,
        toLang,
        function(r){
          translateArea.removeClass('loading');
          var t = r && r.data && r.data.translations && r.data.translations[0].translatedText || '';
          console.log(t);
          translateArea.html(t);
        }
      );
      // history upload      
      chrome.runtime.sendMessage({
        message: 'translate',
        args: JSON.stringify({
          text: text,
          fromLang: fromLang,
          toLang: toLang
        })
      });
    };
    function removeRecentLang(btn){
      var input = btn.parent('.select-lang');
      var type = input.attr('data-type');
      var lang = input.attr('data-lang');
      chrome.runtime.sendMessage({
        message: 'removeRecentLang',
        args: JSON.stringify({
          type: type,
          lang: lang
        })
      },function(r){
        updateLangScrollbarHTML(1, r.fromScrollbarHTML);
        updateLangScrollbarHTML(2, r.toScrollbarHTML);
      });
    };
    function selectLang(input){
      var type = input.attr('data-type');
      var lang = input.attr('data-lang');
      $('.lang-header.'+['src','dist'][type-1]+'-lang').removeClass('display');
      updateCurrentLang(input,type,lang);
    };
  };

  function addDictionaryListener(){
    var api = localStorage.getItem('dic-type'), activeBtn;
    if(api && (activeBtn = $('[data-api="'+api+'"]'))){
      activeBtn.addClass('active').siblings().removeClass('active');
    };

    $('#dictionary-container .tab-content').click(function(e){
      var target = $(e.target);
      if(target.hasClass('btn')){
        target.addClass('active').siblings().removeClass('active');
        localStorage.setItem('dic-type',target.attr('data-api'));
      };
    }).keyup(function(e){
      var target = $(e.target);
      var v = target.val();
      if(e.keyCode == 13 && v && v.length>0){
        var href = window.const.api.translate.href[$('.btn.active').attr('data-api')];
        
        var fromLang = $('#translation-container .src-lang button.lang-show').attr('data-lang').split('-')[0],
            toLang = $('#translation-container .dist-lang button.lang-show').attr('data-lang').split('-')[0];
        href = href.replace('<%fromLang%>',fromLang).replace('<%toLang%>',toLang).replace('<%text%>',v);
        
        chrome.tabs.create({url: href});
      };
    });
  };

  function updateCurrentLang(input,type,lang){
    $('#translation-container .'+['src','dist'][type-1]+'-lang button.lang-show')
    .text(input.text())
    .attr('data-lang',lang);
    $('#translation-container .'+['src','dist'][type-1]+'-lang p.dialog-show')
    .text(input.text())
    .attr('data-lang',lang);

    chrome.runtime.sendMessage({
      message: 'updateCurrentLang',
      args: JSON.stringify({
        type: type,
        lang: lang
      })
    },function(r){
      updateLangScrollbarHTML(1, r.fromScrollbarHTML);
      updateLangScrollbarHTML(2, r.toScrollbarHTML);
    });
  };

  function toggleLangSelectBox(btn){
    $(btn).parents('.lang-header').toggleClass('display');
  };

  function initDropdown(){
    chrome.runtime.sendMessage({
      message: 'getDropdownHTML'
    },function(response){
      updateDropdown(response);
    });
  };

  function updateDropdown(obj){
    $('.lang-header.src-lang').html(obj.fromLangDom);
    $('.lang-header.dist-lang').html(obj.toLangDom);
  };

  function updateLangScrollbar(input,type){
    chrome.runtime.sendMessage({
      message: 'getScrollbarHTML',
      args: JSON.stringify({
        type: type,
        filter: input.val()
      })
    },function(response){
      // updateDropdown(response);
      updateLangScrollbarHTML(type,response);
    });
  };

  function updateLangScrollbarHTML(type,html){
    $('#translation-container .'+['src','dist'][type-1]+'-lang .lang-dialog-scrollbar')
    .html(html);
  };
});
