$(function(){
  $(".sharethis a").click(function(e){
    if(!isMobile.any() && e && e.preventDefault){
      e.preventDefault();
      window.open($(this).attr("href"),'blank','width=450,height=235,status=yes');
    }
  })
})