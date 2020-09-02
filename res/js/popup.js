;(function(){
  let as=document.getElementsByTagName('a');
  
  for(let i = 0;i < as.length; i++) {
    as[i].addEventListener('click',function(){
      console.log(this.innerHTML);
    });
  }

})();




