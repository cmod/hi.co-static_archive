$(function(){

    $('#delete_sketch_button').click(function (argument) {
        var result = window.confirm("Are you sure? This will delete the sketch permanently.");
        if (result == true) {
            window.location = $(this).data("action");
        }
    });

    $('#report_sketch_button').click(function (argument) {
        var result = window.confirm("Are you sure? This will alert us.");
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
            url: $("#extended_sketch_edit").data("action"),//"{{ path('sketch_extended_draft', { id: sketch.id }) }}",
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
            url: $("#extended_sketch_publish").data("action"),//"{{ path('sketch_extended_publish', { id: sketch.id }) }}",
            type: "POST",
            data: {extendedText : extendedDraft, fb_sharing: will_share_fb, tw_sharing: will_share_tw, hi_sharing: will_share_hi},
            dataType: "json",
            cached: false
        });

        request.done(function(msg) {
            if ('success' == msg.status) {
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

                var sharing = {}
                if(will_share_fb){sharing.facebook=1;}
                if(will_share_tw){sharing.twitter=1;}
                window.Analytics.get().trackExtentionPublished( sharing );
                
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
          extendedDraft = originalDraft;
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
        $(".styletips").show();
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

        $(".styletips").hide();
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
            url: $("#extended_sketch_edit").data("action"), //"{{ path('sketch_extended_draft', { id: sketch.id }) }}",
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

});