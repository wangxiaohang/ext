var UL = $('ul.trans-list');
var bd = $('body');
var tool_select = $('.tool.select'),
    tool_move = $('.tool.move'),
    tool_delete = $('.tool.delete');
var lists;
var lis = {all: null};

init();

function init(){
  initContent();
  initHistory();
  initClickListener();
};

function initContent(){
  // sort
  var sort = localStorage.getItem('sort'),
      father = $('.tool.sort .selection');
  if(!sort) sort = 1;
  selectOption(father, father.find('.option').eq(sort-1));
  // selected
  initLisSelected();

};

function initLisSelected(){
  var selected = [];
  Object.defineProperty(lis, 'selected', {
    get: function(){
      return selected;
    },
    set: function(o){ // o: {value, remove}
      // set selected
      if(!o){
        selected = [];
      } else {
        var remove = o.remove;
        var value = o.v;

        if(remove){
          selected.splice(selected.indexOf(value), 1);
        }else if(selected.indexOf(value)<0){
          selected.push(value);
        };
      };
      
      // btn status: body-nodata / tool-move / tool-delete / select-mode-selectAll
      noData(lis.all.length <= 0);
      $('.selection-all')[selected.length == lis.all.length?'addClass':'removeClass']('selected');
    }
  });
};

function noData(no){
  bd[no?'addClass':'removeClass']('no-data');
  bd[no?'removeClass':'addClass']('select-mode');
  if(no) tool_select.removeClass('active');
  activeToolBtns(no?false:(lis.selected.length>0? true:false));
};

function activeToolBtns(active){
  tool_move[active?'addClass':'removeClass']('active');
  tool_delete[active?'addClass':'removeClass']('active');
};

function initHistory(){
  chrome.runtime.sendMessage({
    message: 'searchIDB',
    args: JSON.stringify({
      table: 'history'
    })
  },function(r){
    renderListPanel(r);
  });
};

function initClickListener(){
  $('.content').click(function(e){
    var target = $(e.target);
    // selection option
    if(target.hasClass('option')){
      if(!target.hasClass('active')){
        localStorage.setItem('sort',target.attr('data-id'));
        renderListPanel();
      };
      selectOption(target.parents('.selection'), target);
    }
    // selection title
    else if(target.hasClass('selection')){
      target.toggleClass('pop');
    }else if(target.parents('.selection').length > 0){
      target.parents('.selection').toggleClass('pop');
    }
    // update
    else if(target.hasClass('update')){
      initHistory();
    }
    // select all
    else if(target.hasClass('select')){
      tapSelectToolBtn(target);
    }
    // selection-all
    else if(
      target.hasClass('selection-all') ||
      target.parents('.selection-all').length>0
      ){
      selectAll();
    }
    // select box
    else if(target.hasClass('select-box')){
      var li = target.parents('li');
      selectLis([li],!li.hasClass('selected'));
    }
    // delete
    else if(target.hasClass('delete')){
      deleteHistorys();
    }
  });
};

function renderListPanel(rs){
  if(rs){ // rs 只在初始化时赋值
    lists = rs;
    lis.all = [];
  };
  if(!lists) return;

  // 1. Date; 2:Alphabetic
  var sort = localStorage.getItem('sort');
  if(sort){
    lists.sort(function(a,b){
      return sort == 1?
      a.value.time - b.value.time:
      a.value.input.localeCompare(b.value.input)
    });
  };

  var df = document.createDocumentFragment();
  
  $('<div>').addClass('selection-all').append(
    $('<div>').addClass('select-box')
  ).appendTo(df);

  lists.forEach(function(item){
    if(item.dom){
      $(df).append(item.dom);
      return;
    };

    var lang_from = item.value.from;
    var lang_to = item.value.to;
    var text = item.value.input;
    var time = item.value.time;

    var distText = $('<p>').addClass('dist').addClass('loading');
    getTranslateText(text, lang_from, lang_to, function(r){
      distText.removeClass('loading');
      var t = r && r.data && r.data.translations && r.data.translations[0].translatedText || '';
      distText.html(t)
    });

    var li = $('<li>')
    .attr('data-src-lang', lang_from)
    .attr('data-src-to', lang_to)
    .attr('data-src-time', time)
    .attr('data-src-key',item.key)
    .append(
      $('<div>')
      .addClass('select-box')
    )
    .append(
      $('<p>')
      .addClass('src')
      .html(text)
    )
    .append(distText)
    .append(
      $('<p>')
      .addClass('time')
      .html(getTime(time))
    )
    .appendTo(df);
    item.dom = li;
    if(rs) lis.all.push(li);
  });

  UL.html('');
  UL.append(df);
  // 当前select-mode模式， 非选中状态
  tapSelectToolBtn(null, !bd.hasClass('select-mode')+'','false');
};


function selectLis(lists, selected){
  lists.forEach(function(li){
    if(selected){
      li.addClass('selected');
      lis.selected = {v:li.get(0)};
    }else{
      li.removeClass('selected');
      lis.selected = {v:li.get(0), remove:true};
    };
  });
};

function selectAll(){
  selectLis(lis.all, !$('.selection-all').hasClass('selected'));
};

/**
 * 
 * @param {*} target 全选目标元素，默认Select Translation按钮
 * @param {*} select 当前select-mode状态，将改成相反状态
 * @param {*} toselect 选中状态
 */
function tapSelectToolBtn(target, selectMode, toselect){
  target = target || $('.select');
  var originSelected = selectMode == 'true' ? true : false;
  var active = selectMode ? originSelected : target.hasClass('active');
  var selected = toselect ? (toselect == 'true' ? true : false) : 
                  (active ? false : true);

  if(lis.all.length == 0){
    noData(true);
  }else{
    selectLis(lis.all, selected);
    bd[active? 'removeClass':'addClass']('select-mode');
    tool_select[active? 'removeClass': 'addClass']('active');
  };
};

function deleteHistorys(){
  var keys = [];
  var selectedLis = lis.selected;

  // delete lis.all
  for(var i=0;i<lis.all.length;i++){
    if(selectedLis.indexOf(lis.all[i].get(0)) >= 0){
      lis.all.splice(i,1);
      i--;
    };
  };

  // delete lists
  for(var i=0;i<lists.length;i++){
    if(selectedLis.indexOf(lists[i].dom.get(0)) >= 0){
      lists.splice(i,1);
      i--;
    };    
  };

  // delete dom
  selectedLis.forEach(function(li){
    keys.push($(li).attr('data-src-key'));
    $(li).remove();
  });

  // reset lis.selected
  lis.selected = null;

  // select模式， 非选中状态
  tapSelectToolBtn(null, 'false', 'false');

  chrome.runtime.sendMessage({
    message: 'deleteHistorys',
    args: JSON.stringify({
      table: 'history',
      keys: keys
    })
  },function(r){});
};
