$(function(){

    $(".subscription-list button.action").click(function(e){
        if(e&&e.preventDefault){ e.preventDefault(); }

        var b = $(this),
            username = b.data("username"),
            toggle_url = b.data("href");

        
        $.ajax({
            url: toggle_url,
            method: "get"
        }).complete(function(d){
            d=d.responseJSON;

            if(d.subscriptionStatus && d.subscriptionStatus=="unsubscribed"){
                b.removeClass("unsubscribe").addClass("subscribe").removeClass("hover")
            }

            if(d.subscriptionStatus && d.subscriptionStatus=="subscribed"){
                b.removeClass("subscribe").addClass("unsubscribe").removeClass("hover")
            }

            Analytics.get().trackSubscribeButton( d.subscriptionStatus, "user", d.username, b );
        });
        

    }).mouseover(function(){
        $(this).addClass("hover");
    }).mouseout(function(){
        $(this).removeClass("hover");
    })

    $(".ias_trigger a").click(function(e){
        if(e&&e.preventDefault){ e.preventDefault(); }
        var $this = $(this);
        $this.addClass("wait");
        $.ajax({
            url: $this.attr("href"),
            method: "get",
            "type": "html"
        }).done(function(html){
            var $html = $(html),
                next  = $html.find(".ias_trigger a");
            $(".subscription-list").append($html.find(".subscription-list").html())
            if(next[0]){
                $(".ias_trigger a").attr("href", next.attr("href"));
            }else{
                $(".ias_trigger").remove();
            }
        }).always(function(){
            $this.removeClass("wait");
        })
    })

})