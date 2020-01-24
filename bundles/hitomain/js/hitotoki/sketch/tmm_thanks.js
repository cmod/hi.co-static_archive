$(function(){
    var tmmb = $('#tell_me_more_button');
    tmmb.click(function (e) {
        
          if(e && e.preventDefault){e.preventDefault();}

          if (tmmb.hasClass('disabled')) {
            return;
          }

          if(tmmb.attr("rel") && tmmb.attr("rel")=="auth"){
            return;
          }


          var request = $.ajax({
              url: tmmb.attr("href"),
              type: "POST",
              dataType: "json",
              cached: false,
              beforeSend: function () {
                  tmmb.addClass('disabled');
                  tmmb.html('Requesting');
                  tmmb.innerload();
              }
          });

          request.done(function(msg) {
              if ('success' == msg.status) {
                  $('.tell_me_more').find('.hint').remove();
                  var html = [msg.html.avatarsHtml, '<div class="inline_message">', msg.html.messageHtml, '</div>'].join("")
                  $('#tell_me_more_message').html(html);
                  $('.tell_me_more_button').addClass('disabled').html('Requested');

                  Analytics.get().trackTmmButton( tmmb );
                  $('#tell_me_more_button').trigger("_hi_action_completed");

              } else {
                  $('#tell_me_more_message').css('color', 'red');
                  $('#tell_me_more_message').html(msg.message);
                  $('.tell_me_more_button').removeClass('disabled').html('Tell me More');
              }

              tmmb.trigger("_hi_action_completed")
          });

          request.fail(function(jqXHR, textStatus) {
            var data = jQuery.parseJSON(jqXHR.responseText);
            $('#tell_me_more_message').css('color', 'red');
            $('#tell_me_more_message').html(data.message);

            tmmb.trigger("_hi_action_completed")
          });

    });

    $('form[name=sketch_thanks_form]').submit(function (e) {
        e.preventDefault();


        var thankyouButton = $('#thank_you_button'),
            $this = $(this);
        if (thankyouButton.hasClass('disabled')) {
          return;
        }

        if($this.attr("rel") && $this.attr("rel")=="auth"){
          return;
        }

        var request = $.ajax({
            url: $("#sketch_thanks_form").attr("action"), 
            type: "POST",
            data: { 'form[comment]': $('#form_comment').val(), 'form[_token]': $('#form__token').val() },
            dataType: "json",
            cached: false,
            beforeSend: function () {
                thankyouButton.addClass('disabled');
                thankyouButton.innerload();
            },
        });

        request.done(function(msg) {
            if ('success' == msg.status) {
                $('.tell_me_more').hide('slow', function(){ $(this).remove(); });
                $('.thank_you_button').addClass('disabled').html('Thanked');
                // $('.thank_you').addClass('hidden');
                // $('.thank_you.placeholder').removeClass('hidden');
                $('#form_comment').animate({
                  "width": "toggle", 
                  "opacity": "toggle"
                }, "slow");
                var html = [msg.html.avatarsHtml, '<br/>', msg.html.messageHtml].join("");
                $('.thank_you').css('display', 'block');
                $('.thank_you').find('.thanked').html(html);
                if ('unsubscribed' == msg.subscriptionStatus) {
                  setTimeout(function () {
                      $('.thank_you_form').hide('slow', function(){ $(this).remove(); });
                      $('.subscription').removeClass('hidden');
                  }, 2000);
                }

                Analytics.get().trackThanksButton( $('#form_comment').val()!="", $this );

            } else {
                $('#thank_you_message').css('color', 'red');
                $('#thank_you_message').html(msg.message);
            }

            $this.trigger("_hi_action_completed")
        });

        request.fail(function(jqXHR, textStatus) {
          var data = jQuery.parseJSON(jqXHR.responseText);
          $('#thank_you_message').css('color', 'red');
          $('#thank_you_message').html(data.message);

          $this.trigger("_hi_action_completed")
        });

        return false;

    });

    /* Thanks/conversation */
    // $('.thanks-reply-text').on('focus', function(event) {
    //     $(event.target).parent().find('.reply-btn').addClass('shown');
    // });
    $('.thanks-reply-text').on('keyup change', function(event) {
        if ($(event.target).val() === "") {
            $(event.target).parent().find('.reply-btn').removeClass('shown');
        }else{
            $(event.target).parent().find('.reply-btn').addClass('shown');
        }
    });

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
        $('#form_comment').attr('placeholder', 'Tap to write a short, private message of thanks');
    }

});