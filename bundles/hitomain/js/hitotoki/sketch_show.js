/* ******
 * Not Event sure this is used anywhere...
 * ****** */

var MOBILE_MAX_WIDTH = 768;
var positionImage = function() {
  console.log("Positioning the image");
  var isLandscape = $('#moment_image').hasClass('landscape');
  var cssSide = isLandscape ? 'top' : 'left';

  var offset = $('#moment_image').data('offset');
  var currentImageSize = isLandscape ? $('#moment_image').height() : $('#moment_image').width();
  var wrapSize = isLandscape ? $('.head_wrap').height() : $('.head_wrap').width();
  var position = (currentImageSize - wrapSize)/2 - offset;

  if ((currentImageSize - position) < wrapSize) {
    position = currentImageSize - wrapSize;
  }
  $('#moment_image').css(cssSide, '-' + position + 'px');
};



/* **********
 * Convos and back key (un)binding
 * ********** */ 


$(function(){
  var $document = $(document),
      $window   = $(window)
      $html     = $("html")
      $body     = $("body");


  // Prevent the backspace key from navigating back.
  $(document).unbind('keydown').bind('keydown', function (event) {
      var doPrevent = false;
      if (event.keyCode === 8) {
          var d = event.srcElement || event.target;
          if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))
               || d.tagName.toUpperCase() === 'TEXTAREA' || d.tagName.toUpperCase() === 'H1') {
              doPrevent = d.readOnly || d.disabled;
          }
          else {
              doPrevent = true;
          }
      }

      if (doPrevent) {
          event.preventDefault();
      }
  });

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
      $("#conv-"+data.conversation_id+" .conversation_wrap").append(ret);

      $this.find(".thanks-reply-text").prop("disabled", false).val("").blur();
      $this.find(".reply-btn").html("reply");
      // $("#conv-"+reac+" .conversation_wrap").html( $(html).find("#conv-"+reac+" .conversation_wrap").html() );
    }).fail(function(){
      $this.find(".thanks-reply-text").prop("disabled", false).val("").blur();
      $this.find(".reply-btn").html("reply");
      if(arguments[0]&&arguments[0].status&&arguments[0].status==403){
        alert("Whoa! Hold on a sec. Let's let them reply before sending any more messages :)")
      }
    });


  })
})





$(function(){

  if($html.hasClass("role_user")){
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
  }

    $('#tell_me_more_button').click(function (e) {
        if($html.hasClass("role_user"))
          if(e && e.preventDefault){e.preventDefault();}

          if ($('#tell_me_more_button').hasClass('disabled')) {
            return;
          }
          var request = $.ajax({
              url: $(e.currentTarget).attr("href"),
              type: "POST",
              dataType: "json",
              cached: false,
              beforeSend: function () {
                  var tellMeMoreButton = $('#tell_me_more_button');
                  tellMeMoreButton.addClass('disabled');
                  tellMeMoreButton.html('Requesting');
                  tellMeMoreButton.innerload();
              },
          });

          request.done(function(msg) {
              if ('success' == msg.status) {
                  $('.tell_me_more').find('.hint').remove();
                  var html = msg.html.avatarsHtml+'<div class="inline_message">'+msg.html.messageHtml+'</div>';
                  $('#tell_me_more_message').html(html);
                  $('.tell_me_more_button').addClass('disabled').html('Requested');
              } else {
                  $('#tell_me_more_message').css('color', 'red');
                  $('#tell_me_more_message').html(msg.message);
                  $('.tell_me_more_button').removeClass('disabled').html('Tell me More');
              }
          });

          request.fail(function(jqXHR, textStatus) {
            var data = jQuery.parseJSON(jqXHR.responseText);
            $('#tell_me_more_message').css('color', 'red');
            $('#tell_me_more_message').html(data.message);
          });
        }else{
          location.href = "/login";
        }
    });

    $('form[name=sketch_thanks_form]').submit(function (e) {
        e.preventDefault();
        var thankyouButton = $('#thank_you_button');
        if (thankyouButton.hasClass('disabled')) {
          return;
        }
        var request = $.ajax({
            url: $('form[name=sketch_thanks_form]').attr("action"),
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
                  "width": "toggle", "opacity": "toggle"
                }, "slow");
                var html = msg.html.avatarsHtml+'<br/>'+msg.html.messageHtml;
                $('.thank_you').css('display', 'block');
                $('.thank_you').find('.thanked').html(html);
                if ('unsubscribed' == msg.subscriptionStatus) {
                  setTimeout(function () {
                      $('.thank_you_form').hide('slow', function(){ $(this).remove(); });
                      $('.subscription').removeClass('hidden');
                  }, 2000);
                }
            } else {
                $('#thank_you_message').css('color', 'red');
                $('#thank_you_message').html(msg.message);
            }
        });

        request.fail(function(jqXHR, textStatus) {
          var data = jQuery.parseJSON(jqXHR.responseText);
          $('#thank_you_message').css('color', 'red');
          $('#thank_you_message').html(data.message);
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

    

    if($html.hasClass("role_user") || $html.hasClass("role_editor")){

        $('#delete_sketch_button').click(function (e) {
            if(e&&e.preventDefault){e.preventDefault();};
            var result = window.confirm("Are you sure? This will delete the sketch permanently.");
            if (result == true) {
                window.location = $(this).data("action");
            }
        });

        var isEditorOpen = false;
        var autoSave = false;
        var extendedDraft = '';
        var originalDraft = '';
        var lastSavedDraft = '';
        var extendedText = '';
        var originalHtml = '';
        var extendedHtml = '';

        var editor = $('#extended-editor');
        editor.autosize({append: "\n"});

        var editor_check = function(){
          if(editor.val() != undefined && editor.val().length == 0){
            $("#editor_tools").addClass("publish-disabled");
            $("#extended_sketch_publish").prop("disabled", true);
          }else{
            $("#editor_tools").removeClass("publish-disabled");
            $("#extended_sketch_publish").prop("disabled", false);
          }
        };

        // On Edit
        $('#extended_sketch_edit').click(function (e) {
            $('#extended_sketch_message').html('Loading text...').removeClass("warning");
            $('.editor_help .extended_hint').slideUp();
            $('#extended_button_message').html('');
            var request = $.ajax({
                url: $(this).data("action"),
                type: "GET",
                dataType: "json"
            });

            request.done(function(msg) {
                extendedText = msg.text;
                originalDraft = lastSavedDraft = extendedDraft = msg.draft;
                originalHtml = extendedHtml = msg.html;
                loadEditor();
                editor_check();
                $('#extended_sketch_message').html('').removeClass("warning");
            });
        });

        var will_share_fb = $('#fbCheckbox').prop("checked")?1:null;

        var overlay = $('<div id="big_bad_overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); z-index: 10000;"><div style="font-family: \'freight-big-pro\', Palatino, \'Palatino Linotype\', Georgia, Times, \'Times New Roman\', \'Hiragino Mincho ProN\', serif; color: #666666; padding: 45px; font-size: 3em; border-radius: 5px; box-shadow: 0px 0px 10px #333333; text-align:center; width: 400px; margin: 40px auto; background-color: #f7f7f7; font-shadow: 1px 1px 0px #ffffff;"><strong>WARNING:</strong><br /><br /> It looks like we&rsquo;ve lost our connection to the server.<br /<br /><br /> Don&rsquo;t worry though, we saved your data just a few seconds ago. It probably means we&rsquo;re updating Hi.<br /><br /><br /> Try reloading the page and if you see this message again feel free to contact us:<br /> <a href="mailto:feedback@hi.co">feedback@hi.co</a></div></div>');

        // On publish
        $('#extended_sketch_publish').click(function () {
            $(this).attr('disabled', 'disabled');
            $(this).html('publishing');
            autoSave = false;
            extendedDraft = editor.val();

            var will_share_fb = $("#fbCheckbox").prop("checked");
            var will_share_tw = $("#twCheckbox").prop("checked");
            var will_share_hi = $("#hiCheckbox").prop("checked");
            var request = $.ajax({
                url: $(this).attr("action"),
                type: "POST",
                data: {extendedText : extendedDraft, fb_sharing: will_share_fb, tw_sharing: will_share_tw, hi_sharing: will_share_hi},
                dataType: "json",
                cached: false
            });

            request.done(function(msg) {
                if ('success' == msg.status) {
                    
                    if(will_share_fb) {
                      
                    }
                    if(will_share_tw) {

                    }
                    extendedText = msg.text;
                    lastSavedDraft = extendedDraft = msg.draft;
                    extendedHtml = msg.html;
                    unloadEditor();
                    if (extendedText) {
                        $('#extended_sketch_message').html('Published').removeClass("warning");
                        $('.text').removeClass('draft');
                        $('.tell_me_more').hide('slow', function(){ $target.remove(); });
                    } else {
                        $('#extended_sketch_message').html('').removeClass("warning");;
                    }
                    $('#extended_button_message').html('');
                } else {
                    if (404 == msg.statusCode) {
                        $('#extended_sketch_message').html('The sketch does not exist').addClass("warning");;
                    } else if (403 == msg.statusCode) {
                        $('#extended_sketch_message').html('You are not authorized to make this change').addClass("warning");;
                    }
                }
                $('#extended_sketch_publish').removeAttr('disabled');
                $('#extended_sketch_publish').html('publish');
            });

            request.fail(function(jqXHR, textStatus) {
                if ('timeout' == textStatus) {
                    $('#extended_sketch_message').html('Connection timedout').addClass("warning");
                } else if ('error' == textStatus) {
                    $('#extended_sketch_message').html('Sorry, it looks like there was en error. Please try again.').addClass("warning");
                }
                $('#extended_sketch_publish').removeAttr('disabled');
                $('#extended_sketch_publish').html('publish');
            });
        });

        // On save draft
        $('#extended_sketch_save').click(function () {
            autoSave = false;
            extendedDraft = editor.val();;
            if (extendedText != extendedDraft) {
                saveDraft(null, null, function (status) {
                  unloadEditor();
                });
            }
        });

        // On cancel
        $('#extended_sketch_cancel').click(function () {
            if( window.confirm("Are you sure? This will discard your changes.") ){
              autoSave = false;
              editor.val(originalDraft);
              extendedHtml = originalHtml;
              extendedDraft = '';
              extendedHtml = '';
              saveDraft("Discarding changes" ,"Discarded", function (status) {
                  $('.editor_help .extended_hint').slideDown();
                  unloadEditor();
              });
            }else{
              return false
            }
        });

        function loadEditor(e) {
            $('#extended-text').css('display', 'none');
            $('#extended_sketch_edit').css('disabled', 'true');
            $('#extend_button_and_message').stop().animate({
                opacity: 0,
            }, 500, function () {
                $(this).slideToggle();
            });
            editor.css('display', 'block');
            isEditorOpen = true;
            editor.focus();
            if (extendedDraft && extendedDraft.length) {
                editor.val(extendedDraft).trigger('autosize');
            } else {
                editor.val(extendedText).trigger('autosize');
            }
            getWordCount();
            if (extendedDraft && extendedDraft.length) {
                $('#extended_button_message').html('Unpublished Draft');
            } else {
                $('#extended_button_message').html('');
            }
            autoSave = true;
            $('.subscriber_count').css('display', 'block');
            $("#editor_tools").show();
        };

        function unloadEditor() {
            editor.css('display', 'none');
            isEditorOpen = false;
            autoSave = false;
            $('#extended-text').css('display', 'block');
            $('#extended-text').html(extendedHtml);
            if (extendedText) {
                $('#extended_sketch_edit').html('EDIT THIS STORY');
                $('#extended_sketch_edit').addClass('inactive');
                $('#tell_me_more_message').css('display', 'none');
                $('#thats-all-i-ve-got').remove();
            } else {
                $('#extended_sketch_edit').html('EXTEND THIS MOMENT');
            }
            $('#extended_sketch_message').html('').removeClass("warning");
            if (extendedDraft && extendedDraft.length) {
                $('#extended-text').addClass('draft');
                $('#extended_button_message').html('You have an unpublished draft');
            } else {
                $('#extended_button_message').html('');
                $('#extended-text').removeClass('draft');
            }

            $('.subscriber_count').css('display', 'none');

            $("#editor_tools").hide();
            $('#editor_word_count').html('');
            $('#extend_button_and_message').css('display', 'block').stop().animate({
                opacity: 1
            }, 500, function() {
                // $('#extended_sketch_edit').css('disabled');
            });
        };
        $("#editor_tools").hide();

        // autosave every 5 seconds
        var autoSaveId = setInterval(function(){
            if (isEditorOpen && autoSave) {
                if (navigator.onLine) {
                    extendedDraft = editor.val();
                    if (extendedDraft && extendedDraft != lastSavedDraft) {
                      saveDraft(null, null, function (status) {
                      });
                    }
                } else {
                  overlay.appendTo(document.body);
                  $('#extended_sketch_message').html('WARNING: CONNECTION LOST - DOCUMENT NO LONGER BEING SAVED').addClass("warning");
                  clearInterval(autoSaveId);
                }
            }
        }, 3000);

        editor.bind('keyup cut paste change focus', function() {
            $('#extended_sketch_message').html("").removeClass("warning");
            getWordCount();
            editor_check();
        });

        setTimeout(
          function(){
            $("#editor_tools").removeClass("publish-disabled");
            $("#extended_sketch_publish").prop("disabled", false);
            editor_check();
          }, 250
        )


        function getWordCount() {
            var html = markdown.toHTML(editor.val());
            var count = 0;
            if (html.length) {
                var strippedHtml = html.replace(/(<([^>]+)>)/ig,"").trim();
                if (strippedHtml && strippedHtml.length) {
                    var count = strippedHtml.match(/\S+/g).length;
                }
            }
            var suffix = ' word';
            if (count != 1 ){
                suffix = suffix + 's'
            }
            $('#editor_word_count').html(count + suffix);
        }

        function saveDraft(messageWhileSaving, messageOnSuccess, callback) {
            if (messageWhileSaving) {
                $('#extended_sketch_message').html(messageWhileSaving).removeClass("warning");
            } else {
                $('#extended_sketch_message').html('Saving...').removeClass("warning");
            }

            var request = $.ajax({
                url: $("#extended_sketch_edit").data("action"),
                type: "POST",
                data: {extendedText : extendedDraft},
                dataType: "json",
                cached: false
            });

            request.done(function(msg) {
                if ('success' == msg.status) {
                    extendedText = msg.text;
                    lastSavedDraft = extendedDraft = msg.draft;
                    extendedHtml = msg.html;
                    if (messageOnSuccess) {
                        $('#extended_sketch_message').html(messageOnSuccess).removeClass("warning");
                    } else {
                        $('#extended_sketch_message').html("Saved").removeClass("warning");
                    }
                    if (extendedDraft && extendedDraft.length) {
                        if (editor.css('display') != 'none') {
                            $('#extended_button_message').html('Unpublished Draft');
                        } else {
                            $('#extended_button_message').html('You have an unpublished draft');
                        }
                    }
                    callback(true);
                }
                callback(false);
           });

            request.fail(function(jqXHR, textStatus) {
                if ('timeout' == textStatus) {
                    $('#extended_sketch_message').html('Connection timedout!').addClass("warning");
                } else if ('error' == textStatus) {
                    $('#extended_sketch_message').html('Could not save document!').addClass("warning");
                }
                overlay.appendTo(document.body);
                $('#extended_sketch_message').html('WARNING: CONNECTION LOST - DOCUMENT NO LONGER BEING SAVED').addClass("warning");
                clearInterval(autoSaveId);
                callback(false);
            });

            callback(false);
        }
    }
});
