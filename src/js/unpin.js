(function(){
  
  chrome.windows.getCurrent(function(window) {
    console.log('current window id: '+window.id);
  });
 
  /* window.resizeTo(560,400);
  window.moveTo(300,100); */
})();