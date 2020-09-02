window.const = window.const || {};

var IDB_RW = "readwrite";
var IDB_RO = "readonly";
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;


window.const.idb = {
  db_name: 'master_browser_ext_db',
  db: null,
  tables: { // 用于建索引
    // 表名： { 字段：是否unique }
    history: {
      from: false,
      to: false,
      input: false,
      time: false
    },
    // 单词本
    phrasebooks: {
      name: false,
      create_time: false,
      last_update: false
    },
    // 单词列表
    words: {
      from: false,
      to: false,
      input: false,
      time: false,
      phrasebook_key: false
    }
  },
  structs: { // 用于判断每条记录定义是否完整
    history: {
      from: '',
      to: '',
      input: '',
      time: Date.now()
    },
    phrasebooks: {
      name: '',
      create_time: Date.now(),
      last_update: Date.now()
    },
    words: {
      from: '',
      to: '',
      input: '',
      time: Date.now(),
      phrasebook_key: ''
    }
  },
  cache: {
    history: null,
    phrasebooks: null,
    words: null
  }
};

window.const.idb.checkStruct = function(obj, table){
  var modelKeys = window.const.idb.structs[table];

  if(!modelKeys) return false;

  for(var modelKey in modelKeys){
    if(!(modelKey in obj)) return false;
  };

  for(var k in obj){
    if(!(k in modelKeys)) return false;
  };

  return true;
};

window.const.idb.open = function(version, cb){
  var tables = window.const.idb.tables;
  try {
    var request = window.indexedDB.open(window.const.idb.db_name, version);

    request.onupgradeneeded = function(e){
      var db = e.target.result;
      for(var table in tables){
        if(!db.objectStoreNames.contains(table)){
          db.createObjectStore(table, {autoIncrement: true});
        };
        var store = e.target.transaction.objectStore(table);
        for(var index in tables[table]){
          if(!store.indexNames.contains(index)){
            store.createIndex(index, index, {unique: tables[table][index]});
          }
        }
      }
    };

    request.onsuccess = function(e){
      window.const.idb.db = e.target.result;
      cb && cb();
    };

    request.error = function(e){
      console.log('Could not open IDB:');
      console.log(request.error);
    };
  }catch(e){
    console.log('IndexDB open Error:',e);
  }
};

window.const.idb.add = function(table, obj, cb){
  var db = window.const.idb.db;
  if(db && window.const.idb.checkStruct(obj, table)){
    var request = db.transaction([table], IDB_RW)
                  .objectStore(table)
                  .add(obj);

    request.onsuccess = function(e){
      cb && cb(e.target.result, obj);
    };

    request.onerror = function(e){
      console.log("idb add error", e);
    }
  }else{
    cb && cb(null, null);
    console.log('Db not found or struct error');
  }
};

window.const.idb.get = function(table, id, cb){
  var db = window.const.idb.db;

  if(db){
    var request = db.transaction([table], IDB_RO)
                  .objectStore(table)
                  .get(id);

    request.onsuccess = function(e){
      cb && cb(event.target.result);
    };

    request.onerror = function(e){
      console.log('idb get error,',e);
    };
  }else{
    console.log('idb get, cannot get db');
  };
};

window.const.idb.search = function(table, cb){
  var db = window.const.idb.db;
  var transaction = db.transaction([table], IDB_RO);
  var store = transaction.objectStore(table);
  var cursor_request = store.openCursor();

  var items = [];
  cursor_request.onsuccess = function(event){
    var cursor = event.target.result;
    if(cursor){
      items.push({
        key: cursor.key,
        value: cursor.value
      });
      cursor.continue();
    };
  };

  transaction.oncomplete = function(){
    cb && cb(items);
  };
};

window.const.idb.del = function(table,keys,cb){
  console.log('bg del:');
  console.log(table);
  console.log(keys);
  var db = window.const.idb.db;
  if(db){
    var transaction = db.transaction([table],IDB_RW);
    var store = transaction.objectStore(table);

    keys.forEach(function(key){
      store.delete(key-0);
    });

    transaction.oncomplete = function(e){
      cb && cb(true);
    };
    transaction.onerror = function(e){
      console.log(e);
    }
  }else{
    console.log('idb del: cannot get db');
    cb && cb(false);
  }
};

window.const.idb.clear = function(table,cb){
  console.log('bg clear:');
  console.log(table);
  var db = window.const.idb.db;
  if(db){
    var request = db.transaction([table], IDB_RW)
                  .objectStore(table)
                  .clear();
    request.onsuccess = function(e){
      cb && cb(true);
    };
  }else{
    console.log('idb clear: cannot get db');
    cb && cb(false);
  }
};
