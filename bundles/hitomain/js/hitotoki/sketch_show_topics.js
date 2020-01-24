$(function(){
  var username = window.current_sketch.user.usernameCanonical;
  var defaultTopics = window.current_sketch.defaultTopics;
  var closeOnOpen = false;
  var currentValue = '';
  var addedTopics = [];
  var selectizeOptions = {
      plugins: ['remove_button'],
      valueField: 'name',
      labelField: 'name',
      searchField: ['name'],
      options: defaultTopics,
      delimiter: ',',
      loadThrottle: 100,
      persist: false,
      addPrecedence: true,
      create: function (input) {
        return {
          id: input,
          name: input,
        };
      },
      highlight: false,
      hideSelected: true,
      openOnFocus: false,
      load: function(query, callback) {
          if (!query.length) return callback();
          $.ajax({
              url: window.topic_paths.api_get_topics,
              data: { filter: encodeURIComponent(query) },
              type: 'GET',
              dataType: 'json',
              error: function() {
                  callback();
              },
              success: function(res) {
                  callback(res.topics.slice(0,10));
              }
          });
      },
      onItemAdd: function (value, $item) {
        selectize.refreshItems();
        updateTopics();
        selectize.close();
        addedTopics.push(value);
      },
      onItemRemove: function (value) {
        closeOnOpen = true;
        selectize.refreshItems();
        updateTopics();
        selectize.close();
        for(var i = addedTopics.length - 1; i >= 0; i--) {
            if(addedTopics[i] === value) {
               addedTopics.splice(i, 1);
            }
        }
      }
  };
  var $select = $('#topic_tags').selectize(selectizeOptions);
  var selectize = $select[0].selectize;

  selectize.on('dropdown_open', function ($dropdown) {
    if (closeOnOpen && selectize.isOpen) {
      closeOnOpen = false;
      selectize.close();
    }
  });

  selectize.on('dropdown_open', function ($dropdown) {
    if (closeOnOpen && selectize.isOpen) {
      closeOnOpen = false;
      selectize.close();
    }
  });

  $(document).on('click', '.recent_topic', function (e) {
    e.preventDefault();
    selectize.addOption({ name: $(this).attr('rel').toString() });
    selectize.refreshOptions();
    selectize.addItem($(this).attr('rel').toString());
    selectize.refreshItems();
    selectize.close();
    $(this).addClass('used');
  });

  function updateTopics() {
    var input = $('#topic_tags').val().split(',');
    var data = { topics: []};
    for (key in input) {
      if (input[key].length) {
        data.topics.push({ name: input[key] });
      }
    }
    var request = $.ajax({
        url: window.topic_paths.api_post_sketch_topics,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        processData: false,
        cached: false,
        contentType: 'application/json'
    });

    request.done(function(msg) {
      $('#topics_message').html('Saved!');
      
      var topicsListHtml = '';
      for (var key in msg.topics) {
        topicsListHtml += '<li><a href="'+ Routing.generate('topic_view', { usernameCanonical: username, slug: msg.topics[key].slug }) +'" class="topic_name">' + msg.topics[key].name + '</a></li>';
      }
      if (msg.topics.length) {
        topicsListHtml = '<h5>Filed under</h5> ' + topicsListHtml;
      } else {
        topicsListHtml = '';
      }
      $('#topics_list').html(topicsListHtml);

      var topicsListHtmlSimple = [];
      var slugs = [];
      for (var key in msg.topics_url) {
        var i = msg.topics_url[key];
        topicsListHtmlSimple.push('<a href="'+ i.url +'" class="topic_name">' + i.name + '</a>');
        slugs.push(i.slug);
      }
      $("h2.topic_list .topic_list_wrap").html(topicsListHtmlSimple.join(", "))

      /* **************************************** */
      /* **************************************** */
      /* **************************************** */

      try{
        window.ftopiccall.abort()
      }catch(e){}

      window.ftopiccall = $.ajax({
        url: Routing.generate('topic_info', { slug: slugs.join(",") }),
        method: "get"
      }).done(function(data){
        if(data.name){
          data=[data];
        }

        var classname = "large-4 medium-4 columns";
        if(data.length==2){
          var classname = "large-4 large-offset-2 medium-4 medium-offset-2 columns double";
        }
        if(data.length==1){
          var classname = "large-4 large-offset-4 medium-4 medium-offset-4 columns";
        }
        var tpl = function(dt){

          var all = [
            '<div class="'+classname+'">',
              '<a href="<%=path%>">',
                '<div class="topic_block" style="background-color: $6f7053; <%=background%>">',
                  '<div class="topic_data">',
                    '<span class="name"><%=name%></span>',
                    '<span class="stats"><%=stats%></span>',
                  '</div>',
                '</div>',
              '</a>',
            '</div>'
          ].join("");
          for(var a in dt){
            all = all.split("<%="+a+"%>").join(dt[a]);
          }
          return all;
        }



        var newtp = [];
        for(var a=0; a<data.length; a++){
          var item = data[a];
          item.background = item.cover ? "background-image:url("+item.cover.medium+")" : "";
          item.stats = item.usercount + " writers and "+item.wordcount+" words";
          console.info(item);
          newtp.push(tpl(item));
        }
        var filed_under_cont = $(".filed_under_container");
        if(!filed_under_cont[0]){
          filed_under_cont = $("<div></div>").addClass("filed_under_container");
          $('.filed_under').append('<h5>Filed Under</h5>').append(filed_under_cont);
        }
        console.info("added:", newtp );
        filed_under_cont.html( newtp.splice(0,3).join("") )



      });

      /* **************************************** */
      /* **************************************** */
      /* **************************************** */


    });

    request.fail(function(jqXHR, textStatus) {
      $('#topics_message').html('Error while saving!');
    });
  }

  $(document).on('focus', '.selectize-input > input[type=text]', function (e) {
    // $('html, body').animate({scrollTop:$(".topics").offset().top}, 'slow');
    return false;
  })

  $(document).on('click', '.topics_save_hide', function(e){
    if(e && e.preventDefault){
      e.preventDefault();
    }
    updateTopics();
    hideWidget();
    transferControl();

    {% if is_granted('ROLE_EDITOR') and sketch.user != app.user %}
    // ask to send email with addedTopics
    // reset addedTopics
    if(addedTopics.length > 0){
      $(".topics_save_hide").prop("disabled", true);
      $.ajax({
        url: window.topic_paths.sketch_send_editor_email_topic,
        data: {topics: addedTopics},
        method: "post"
      }).done(function(bd){
        addedTopics = []
        $(".topics_save_hide").prop("disabled", false);
      })
    }

    {% endif %}
  });

  $(document).on('click' ,'.add_to_topic', function(e){
    e.preventDefault();
    transferControl();
    showWidget();
    return false;
  });

  function showWidget() {
    $('.topics').fadeIn('slow', 'swing');
    $('#topics_message').html('');
    $("button.add_to_topic, h2.topic_list").fadeOut();
    selectize.focus();
  }

  function hideWidget() {
    $('.topics').fadeOut('slow', 'swing');
    $("h2.topic_list, button.add_to_topic").fadeIn();
  }

  {% if not sketch.topics.count %}
    showWidget();
  {% endif %}

  function transferControl() {
    if ($('#top-widget').length && !$('#inline-widget').length) {
      var innerHtml = '<div class="container topics"> <div class="row sidepanel"> <div class="large-12 columns"> <div id="topics_message">&nbsp;</div> <input type="hidden" placeholder="Add to a topic? (Max: 3)" style="display:none;" value="{% for topic in sketch.topics %}{{ topic.name|raw|e('html') }}{% if not loop.last %},{% endif %}{% endfor %}" id="topic_tags"> <button class="btn topics_save_hide">Done</button> <div class="recent_topics"> <h3>Recent topics:</h3> {% for topic in app.user.topics(3) %} {% set topicUsed = false %} {% for sketchTopic in sketch.topics %} {% if topic == sketchTopic.name %}{% set topicUsed = true %}{% endif %} {% endfor %} <a href="#" class="recent_topic{% if topicUsed %} used{% endif %}" rel="{{ topic }}">{{ topic }}</a> {% endfor %} </div> </div> </div> </div>';
      selectize.destroy();
      $('.topics').remove();
      $('.filed_under').prepend(innerHtml);
      $select = $('#topic_tags').selectize(selectizeOptions);
      selectize = $select[0].selectize;
    }
  }
})