init();
function init(){
  initStorage(function(){
    window.handler.updateLangDialogHTML(1,true);
    window.handler.updateLangDialogHTML(2,true);
  });
  initIDB();
  initEvents();
  initPreviouslyOpenedTabs();
};

function initEvents(){
  chrome.runtime.onMessage.addListener(function(data, sender, res){
    if(data.message){
      var args;
      if(data.args){
        args = JSON.parse(data.args);
      };
      if(data.async){
        window.events[data.message](args, function(t){
          var r = JSON.stringify({res: t});
          res(r);
        });
      }else{
        var text = window.events[data.message](args);
        res(text);
      };
    };
    return true;
  });
};

function initStorage(cb){
  var stors = window.const.storage;
  chrome.storage.local.get(Object.keys(stors), function(items){
    for(var key in items){
      if(items[key] && items[key] !== stors[key]){
        stors[key] = items[key];
      };
    };
    cb && cb();
  });
};

function initIDB(){
  try {
    window.const.idb.open(1, function(){
      window.const.idb.search('history',function(history){
        window.const.idb.cache.history = history;
      });
      window.const.idb.search('phrasebooks',function(phrasebooks){
        window.const.idb.cache.phrasebooks = phrasebooks;
      });
      window.const.idb.search('words',function(words){
        window.const.idb.cache.words = words;
      });
    });
  }catch(e){
    console.log('open error:',e);
  };
};

function initPreviouslyOpenedTabs() {
  var injectIntoTab = function (tab) {
      var content_scripts = chrome.runtime.getManifest().content_scripts[0];
      var scripts = content_scripts.js;

      for (var i = 0, s = scripts.length; i < s; i++) {
          chrome.tabs.executeScript(tab.id, {
              file: scripts[i]
          });
      }
      
      var styles = content_scripts.css;
      for (var i = 0, s = styles.length; i < s; i++) {
          chrome.tabs.insertCSS(tab.id, {
              file: styles[i]
          });
      }
  };

  chrome.windows.getAll({
      populate: true
  }, function (windows) {
      for (let i = 0, w = windows.length; i < w; i++) {
          let currentWindow = windows[i];

          for (let j = 0, t = currentWindow.tabs.length; j < t; j++) {
              let currentTab = currentWindow.tabs[j];
              // 是否被卸载：指内容已被卸载但仍存在于tab栏，下次激活会重新加载
              let discarded = typeof currentTab.discarded === 'boolean' && currentTab.discarded;
              // 不是插件所属页面，并且没有被卸载
              if (!currentTab.url.match(/chrome(-extension)?:\/\//gi) && !discarded) {
                  injectIntoTab(currentTab);
              }
          }
      }
  });
}
