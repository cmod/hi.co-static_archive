$(function(){
    $(".social-actions-wrapper input[type=checkbox]").hide()

    function updateInWordSharing(){
      var p         = $("p.inwords span"),
          subcount  = Number($("p.inwords").data("subscribers")),
          checkbox0 = $("#hi_share_switch input"),
          checkbox  = $("#facebook_share_switch input"),
          checkbox2 = $("#twitter_share_switch input"),
          submin    = 10
          soc       = []
          sub       = subcount>=submin ? "your "+subcount+" subscribers" : "your subscribers";

      if(checkbox.prop("checked")){
        soc.push("Facebook")
      }
      if(checkbox2.prop("checked")){
        soc.push("Twitter")
      }
      if(checkbox0.prop("checked")){
        soc.push(sub)
      }

      if(soc.length){
        if(soc.length>1){
          var last = soc.pop()
          p.text( "Publish to " + soc.join(", ") + " and " + last);
        }else{
          p.text( "Publish to " + soc[0]);
        }

      }else{
          p.text( "");
      }
    }

    if( /*($.cookie('auto_fb_active')==0||$.cookie('auto_fb_active')==1)&&*/ !$("#facebook_share_switch").data("action") ){
        $("#facebook_share_switch input").prop("checked", !!Number($.cookie('auto_fb_active')))
    }
    //if( !$("#facebook_share_switch input").prop("checked") ){
    if( $("#facebook_share_switch").data("action") ){
        $("#facebook_share_switch label").click(function(e){
            if(e&&e.preventDefault){e.preventDefault();};

            var action = $("#facebook_share_switch").data("action"),
                scopes = $("#facebook_share_switch").data("scope");

            console.info("asking FB");
            $("#facebook_share_switch p.inwords span").text("connecting to Facebook...");
            FB.login(function(response){
                $("#facebook_share_switch p.inwords span").text("finalizing connection to Facebook...");
                if(!response.authResponse){
                  setTimeout(updateInWordSharing, 50);
                  return;
                }
                $.ajax({
                    url: action,
                    method: "post",
                    data: response.authResponse
                }).done(function(data){
                  if(data.error){
                    alert(data.error);
                  }else{
                    $("#facebook_share_switch label").off()
                    $("#facebook_share_switch input").prop("checked", true);
                    $.cookie('auto_fb_active', 1);
                    $("#facebook_share_switch label").click(function(){
                        console.info("pressed!");
                        setTimeout(function(){
                            var v = $("#facebook_share_switch input").prop("checked")?1:0;
                            $.cookie('auto_fb_active', v);
                            setTimeout(function(){$(".social-actions-wrapper label").blur()}, 50)
                            setTimeout(updateInWordSharing, 100);
                        }, 100);
                    })
                    setTimeout(updateInWordSharing, 50);
                  }
                })
              }, {scope: scopes})


        })
    }else{
        $("#facebook_share_switch label").click(function(){
            setTimeout(function(){
                var v = $("#facebook_share_switch input").prop("checked")?1:0;
                $.cookie('auto_fb_active', v);
                setTimeout(function(){$(".social-actions-wrapper label").blur()}, 50)
            }, 100);
            setTimeout(updateInWordSharing, 100);
        })
    }

    if( !$("#twitter_share_switch").data("login") ){
        $("#twitter_share_switch input").prop("checked", !!Number($.cookie('auto_tw_active')))
    }else{
        $("#twitter_share_switch input").prop("checked", false)
    }

    if( $("#twitter_share_switch").data("login") ){
        $('#twitter_share_switch label').click(function(e){
            if(e&&e.preventDefault){e.preventDefault();};

            $.oauthpopup({
                path: $("#twitter_share_switch").data("login"),
                callback: function(){
                    $.ajax({
                        url: $("#twitter_share_switch").data("check"),
                        type: "json",
                        method: "get"
                    }).done(function(d){
                        console.info(d, arguments);
                        if(d.twitter_token){
                            // ok
                            $("#twitter_share_switch input").prop("checked", true);
                            $('#twitter_share_switch label').off();
                            $.cookie('auto_tw_active', 1);
                            setTimeout(updateInWordSharing, 50);
                            $("#twitter_share_switch label").click(function(){
                                setTimeout(function(){
                                    var v = $("#twitter_share_switch input").prop("checked")?1:0;
                                    $.cookie('auto_tw_active', v);
                                }, 100);
                                setTimeout(function(){$(".social-actions-wrapper label").blur()}, 50)
                                setTimeout(updateInWordSharing, 50);
                            })
                        }else{
                            alert("This twitter user is already linked to another Hi account.")
                            $("#twitter_share_switch input").prop("checked", false);
                        }
                    })
                }
            });
        });
    }else{
        $("#twitter_share_switch label").click(function(){
            setTimeout(function(){
                var v = $("#twitter_share_switch input").prop("checked")?1:0;
                $.cookie('auto_tw_active', v);
                setTimeout(function(){$(".social-actions-wrapper label").blur()}, 50)
            }, 100);
            setTimeout(updateInWordSharing, 50);
        })
    }

    $("#hi_share_switch input").prop("checked", true)
    $("#hi_share_switch label").click(function(){
        setTimeout(function(){
            var v = $("#hi_share_switch input").prop("checked")?1:0;
            $.cookie('auto_hi_active', v);
        }, 100);
        setTimeout(updateInWordSharing, 50);
    })

    setTimeout(updateInWordSharing, 100);
});