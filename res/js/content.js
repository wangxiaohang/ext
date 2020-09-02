//window.onload = function() {
(function(){
  
  var objImg = new Image();
  objImg.classList.add('master-browser-transalte-icon');
  objImg.src = chrome.extension.getURL('res/images/logo.png');
  objImg.alt = 'Translate';
  objImg.title = 'Translate';
  objImg.style.display = 'none';
  objImg.style.position = 'fixed';
  objImg.style.cursor = 'pointer';
  objImg.style.width='32px';
  objImg.style.zIndex=new Date().getTime();

  var _left, _top;

  document.body.appendChild(objImg);

  function selectText() {
    if (document.selection) { //For ie
      return document.selection.createRange().text;
    } else {
      return window.getSelection().toString();
    }
  }

  document.onmouseup = function(ev) {
    var
      ev = ev || window.event,
      left = ev.clientX,
      top = ev.clientY - 48;

    _left = left;
    _top = top;

    // setTimeout(function() {
    //   if (selectText().length > 0) {
    //     setTimeout(function() {
    //       objImg.style.display = 'block';
    //       objImg.style.left = left + 'px';
    //       objImg.style.top = (top<0?top+64:top) + 'px';
    //     }, 100);
    //   }
    // }, 200);
    var timer;
    if (selectText().length > 0) {
      objImg.style.display = 'block';
      objImg.style.left = left + 'px';
      objImg.style.top = (top<0?top+64:top) + 'px';
      timer = setTimeout(function(){
        clearTimeout(timer);
        objImg.style.display = 'none';
      },3000);
    }
  }

  objImg.onclick = function(ev) {
    //window.location.href = 'http://v.t.sina.com.cn/share/share.php?searchPic=false&title=' + selectText() + '&url=' + window.location.href;
    // alert('待翻译的文本：'+selectText());
    showLoading(true);

    var text = selectText();

    try{
      chrome.runtime.sendMessage({
        message: 'getTranslateResult',
        args: JSON.stringify({
          text: text
        }),
        async: true
      },function(t){
        var txt = JSON.parse(t).res;
        showLoading(false);
        console.log(txt);
        if(txt) showTranslateResult(true,txt);
      });
    }catch(e){
      showLoading(false);
      showTranslateResult(false);
      console.log(e);
    };
  };

  //鼠标松开会触发document的mouseup事件/冒泡

  objImg.onmouseup = function(ev) {
    var ev = ev || window.event;
    ev.cancelBubble = true;
  }

  document.onclick = function(ev) {
    // objImg.style.display = 'none';
    
    if(!$(ev.target).hasClass('master-browser-transalte-icon')){
      showLoading(false);  
      showTranslateResult(false);   
    };  
  }

//}

function showLoading(isShow){
  if(isShow){
    $('<div>').addClass('master-browser-loading')
    // .addClass('pop-win')
    .css({
      'left': _left+'px',
      'top': _top+'px'
    })
    .append('<span>').append('<span>').append('<span>').append('<span>').append('<span>')
    .appendTo($('body'));

    var timer = setTimeout(function(){
      clearTimeout(timer);
      $('.master-browser-loading').remove();
    }, 5000);
  }else{
    $('.master-browser-loading').remove();
  };
};

function showTranslateResult(isShow, text){
  if(isShow){
    var panel = $('<div>').addClass('master-browser-translate-panel')
    .addClass('pop-win')
    .css({
      'left': _left+'px',
      'top': _top+'px'
    })
    .append(
      $('<p>')
      .html(text)
    )
    .appendTo($('body'));

    objImg.style.display = 'none';

    var hei = panel.outerHeight() - 0 + 10;
    if(_top - 0 + hei > window.innerHeight){
      _top = window.innerHeight - hei;
      panel.css({
        'top': _top + 'px'
      });
    };
    var left = panel.outerWidth() - 0 + 50;
    if(_left - 0 + left > window.innerWidth){
      _left = window.innerWidth - left;
      panel.css({
        'left': _left + 'px'
      });
    }
  }else{
    $('.master-browser-translate-panel').remove();
  };
}

})();