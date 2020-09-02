window.events = window.events || {};


window.events['translate'] = function(args){
  var text = args.text;
  var fromLang = args.fromLang || window.const.storage.lang_from;
  var toLang = args.toLang || window.const.storage.lang_to;
  var time = Date.now();

  var item = {
    from: fromLang,
    to: toLang,
    input: text,
    time: time
  };
  window.const.idb.add('history', item, function(key,value){
    window.const.idb.cache.history.push({
      key: key,
      value: value
    });
  });
};

window.events['searchIDB'] = function(args){
  var table = args.table;
  var r = window.const.idb.cache[table] || [];
  return r;
};

window.events['deleteHistorys'] = function(args){
  var table = args.table;
  var keys = args.keys;
  if(keys.length == window.const.idb.cache[table].length){
    window.const.idb.clear(table,function(r){
      window.const.idb.cache[table] = [];
      return r;
    });
  }else{
    window.const.idb.del(table,keys,function(r){
      var ccs = window.const.idb.cache[table];
      for(var i=0; i< ccs.length; i++){
        if(keys.indexOf(ccs[i].key+'') >= 0){
          ccs.splice(i,1);
          i--;
        };
      };
      return r;
    });
  };
};
