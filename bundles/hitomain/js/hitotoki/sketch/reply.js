$(function(){
          // $("#fancybox").fancybox({
          //     'type': 'image'
          // });
          // Prevent the backspace key from navigating back.

          $(".reply-form").on("submit", function(e){
            if(e&&e.preventDefault){
              e.preventDefault()
            }
            var $this = $(this)
                href  = $this.attr("action")
                data  = {
                  text: $(this).find("input.thanks-reply-text").val()
                }
                reac  = $this.data("reaction");

            $this.find(".thanks-reply-text").prop("disabled", true);
            //$this.find(".reply-btn").val(" … ");
            $this.find(".reply-btn").empty().innerload()
            $.ajax({
              url: href,
              data: data,
              method: "post",
              type: "json"
            }).done(function(data){
              var tpl = [
                '<li class="reply">',
                  '<a href="/people/<%=username%>"><img src="<%=profile_image%>" class="small-user-avatar" /></a><%=text%>',
                '</li>'
              ].join("");
              var comps = ["full_name", "username", "profile_image", "text"], i, ret=tpl+"";
              for(i in comps){
                  ret=ret.split("<%="+comps[i]+"%>").join( data[comps[i]] );
              }
              if (data.is_new) {
                $("#conv-new").attr('id', "conv-"+data.conversation_id);
                $("#conv-"+data.conversation_id+" > form").attr('action', Routing.generate('conversation_update', { id: data.conversation_id }));
              }
              $("#conv-"+data.conversation_id+" .conversation_wrap").append(ret);

              $this.find(".thanks-reply-text").prop("disabled", false).val("").blur();
              $this.find(".reply-btn").html("reply");
              // $("#conv-"+reac+" .conversation_wrap").html( $(html).find("#conv-"+reac+" .conversation_wrap").html() );
            }).fail(function(){
              $this.find(".thanks-reply-text").prop("disabled", false).blur();
              $this.find(".reply-btn").html("reply");

              if(arguments[0]&&arguments[0].status&&arguments[0].status==403){
                if(arguments[0].responseJSON && arguments[0].responseJSON.message){
                  alert(arguments[0].responseJSON.message)
                }else{
                  alert("Whoa! Hold on a sec. Let's let them reply before sending any more messages :)")
                }
              }
            });


          })
        })