window.handler = window.handler || {};

window.handler.getLangSelectScrollbarHTML = function(type, filter){
  var all = window.handler.getAllLangs(type,filter);
  var ordered = all.all;
  var current = all.current;
  var recent = window.handler.getRecentLangs(type, filter);
  var scrollbar = $('<div>').addClass('lang-dialog-scrollbar');

  var recents = $('<div>')
                .addClass('lang-dialog-section')
                .addClass('recently-used')
                .append(
                  $('<p>').addClass('title').html('Recently used')
                ).appendTo(scrollbar);

  var alls = $('<div>')
            .addClass('lang-dialog-section')
            .addClass('all-lang')
            .append(
              $('<p>').addClass('title').html('All')
            ).appendTo(scrollbar);

  recent.forEach(function(v){
    recents.append(
      $('<p>').addClass('select-lang')
              .addClass(v.key == current.key? 'current': '')
              .html(v.i18n)
              .attr('data-lang',v.value)
              .attr('data-type',type)
              .append($('<button>').addClass('close close-recent'))
    )
  });
  ordered.forEach(function(v){
    alls.append(
      $('<p>')
      .addClass('select-lang')
      .addClass(v.key == current.key? 'current': '')
      .html(v.i18n)
      .attr('data-lang',v.value)
      .attr('data-type',type)
    )
  });
  return scrollbar;
};

window.handler.getDropdownHtml = function(type){
  var all = window.handler.getAllLangs(type);
  var current = all.current;

  var df = document.createDocumentFragment();
  
  var selectHeader = $('<button>')
            .addClass('lang-show')
            .attr('data-lang',current.value)
            .html(current.i18n)
            .appendTo(df);

  var dialog = $('<div>')
            .addClass('lang-dialog')
            .append(
                $('<p>')
                .addClass('show')
                .addClass('dialog-show')
                .attr('data-lang',current.value)
                .html(current.i18n)
            ).append(
                $('<div>')
                .addClass('search')
                .append(
                    $('<input>')
                    .attr('type','text')
                    .attr('id',['src','dist'][type-1]+'-lang-search')
                    .attr('placeholder','Select Language')
                ).append(
                    $('<button>')
                    .addClass('search-btn')
                )
            ).appendTo(df);

  window.handler.getLangSelectScrollbarHTML(type).appendTo(dialog);

  return df;
};

window.handler.updateLangDialogHTML = function(type,store){
  var dom = window.handler.getDropdownHtml(type);
  if(store) window.const.storage[['from','to'][type-1]+'LangDialogHTML'] = $('<div>').append(dom).html();
  return dom;
};
