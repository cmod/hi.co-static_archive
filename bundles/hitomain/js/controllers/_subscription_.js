HI.Controller.Subscription = (function() {

  function initSubscriptionLinks() {
    $(document)
      .on('mouseover', '.subscription_button', function(e) {
        var t = $(e.target);
        if (t.data('state') && t.data('state').toLowerCase() == 'subscribed') {
          t.html('Unsubscribe?');
        }
      })
      .on('mouseout', '.subscription_button', function(e) {
        var t = $(e.target);
        if (t.data('state') && t.data('state').toLowerCase() == 'subscribed') {
          t.html('<span>&#10003;</span> Subscribed');
        }
      })
      .on('click', '.subscription_button', function(e) {
        e.preventDefault();
        $this = $(e.target);
        if ($this.hasClass('disabled')) {
          return;
        }

        var subType = $this.attr('data-sub-type').toString(),
            url,
            object_value;

        if (subType == 'user') {
          object_value = $this.attr('data-username');
          url = Routing.generate('person_subscription_toggle', { username: $this.attr('data-username') });
        } else if (subType == 'topic') {
          object_value = $this.attr('data-topic');
          url = Routing.generate('topic_subscription_toggle', { slug: $this.attr('data-topic') });
        } else if (subType == 'place') {
          object_value = $this.attr('data-city')+" / "+$this.attr('data-country');
          url = Routing.generate('place_subscription_toggle', { city: $this.attr('data-city'), country: $this.attr('data-country') });
        } else {
          return;
        }

        var request = $.ajax({
          url: url,
          type: "POST",
          dataType: "json",
          cached: false,
          beforeSend: function () {
            $this.addClass('disabled');
            if ($this.attr('data-state') != 'subscribed') {
              $this.html('Subscribing');
            }
            if ($this.attr('data-state').toLowerCase() == 'subscribed') {
              $this.html('Unsubscribing');
            }
            $this.append('<div id="circleG"><div id="circleG_1" class="circleG"></div><div id="circleG_2" class="circleG"></div><div id="circleG_3" class="circleG"></div></div>');
          },
        });

        request.done(function(msg) {
          setTimeout(function(){ $this.find("#circleG").remove(); }, 500)
          if ('success' == msg.status) {
            if ('subscribed' == msg.subscriptionStatus) {
              $this.attr('data-state', 'subscribed');
              $this.removeClass('disabled').addClass('inactive').html('<span>&#10003;</span> Subscribed');
              $('.subscription').find('.hint').fadeOut('slow', function(){ $(this).remove(); });
            }
            if ('unsubscribed' == msg.subscriptionStatus) {
              $this.attr('data-state', 'unsubscribed');
              $this.addClass('inactive').html('Unsubscribed');
              setTimeout(function () {
                  $this.removeClass('disabled').removeClass('inactive').html('Subscribe');
              }, 2000);
            }
            Analytics.get().trackSubscribeButton( msg.subscriptionStatus, subType, object_value, $this );
          }
        });

        request.fail(function(jqXHR, textStatus) {
          alert("Sorry — you encountered an error. Please try again later.");
          $this.removeClass('disabled').removeClass('inactive').html('Subscribe');
        });
      });
  }

  return {
    initSubscriptionLinks: initSubscriptionLinks
  };
}());
