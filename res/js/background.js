chrome.contextMenus.create({title:"Translate '%s'",contexts: ["all"], "onclick": onRequest});

function onRequest(info, tab) {
  var selection = info.selectionText;
  //do something with the selection
  //console.log(selection);
  alert('选择的文本: '+selection);
}