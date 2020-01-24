


function initInfinite(next_selector, item_container_selector){

    $(next_selector).on("click", function(e){
      if(e&&e.preventDefault){e.preventDefault()}
      var $this = $(this);

      // loading state
      $this.text("").innerload();

      // load the next page
      $.ajax({
        method: "get",
        type: "html",
        url: $this.attr("href")
      }).done(function(d){
        var $html = $(d),
            new_posts = $html.find(item_container_selector).html(),
            next = $html.find(next_selector);

        $this.innerload("kill").text("Load More");
        $(item_container_selector).append(new_posts);

        if(next[0]){
          $this.attr("href", next.attr("href"));
        }else{
          $this.remove();
        }

      });
    })

}