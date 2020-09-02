var settings = {
  // storage/name : id
  'night_mode': 'night-mode'
};
var settingsReverse = {
  // id: storage/name
  'night-mode': 'night_mode'
};

init();

function init(){
  initText();
  initSettings();
  initClickListener();
};

function initText(){
  var words = [
    'Settings_Translation_KeyCombos', // 页面上
    'Kernel_SettingsTitle', // 设置
    'Settings_Contacts' // 更多
  ];

  chrome.runtime.sendMessage({
    message: 'getI18N',
    args: JSON.stringify({
      words: words
    })
  },function(r){
    renderText(r);
  });

  function renderText(r){
    // {word: 翻译后的word}
    console.log(r);
  };
};

function initSettings(){
  var s = Object.keys(settings);
  chrome.runtime.sendMessage({
    message: 'getSettings',
    args: JSON.stringify({
      settings: s
    })
  },function(r){
    initSettingsStatus(r);
  });

  function initSettingsStatus(r){
    for(var k in r){
      if(r[k] == 1){
        $('#'+settings[k]).addClass('selected');
      };
    };
  };
};

function initClickListener(){
  $('body').click(function(e){
    var target = $(e.target);
    // tab 标题
    if(target.hasClass('tab-header')){
      target.addClass('active').siblings().removeClass('active');
      $('#'+target.attr('data-tab')).addClass('active').siblings().removeClass('active');
    }
    // 设置项
    else if(
      target.hasClass('setting-item') || 
      target.parents('.setting-item').length > 0
      ){
      toggleSelectStatus(target);
    };
  });
};

function toggleSelectStatus(t){
  var target = t.hasClass('setting-item') ? t : t.parents('.setting-item');
  target.toggleClass('selected');
  // 上报
  var id = target.attr('id');
  var key = settingsReverse[id];
  var value = target.hasClass('selected') ? 1 : 0;
  if(key){
    chrome.runtime.sendMessage({
      message: 'updateSetting',
      args: JSON.stringify({
        key: key,
        value: value
      })
    },function(r){});
  };
};
