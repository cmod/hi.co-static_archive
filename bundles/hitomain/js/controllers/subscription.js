HI.Controller.Subscription = (function(){

    function Subscription(){
        this.buttons = $(".subscription_button");

        this.buttons
            .on("mouseover", _.bind(this.mouseover, this) )
            .on("mouseout", _.bind(this.mouseout, this) )
            .on("click", _.bind(this.click, this) )
        ;

        $(".subscribetoallfb").on("click", _.bind(this.subscribetoallfb, this) );
    }

    Subscription.initSubscriptionLinks = function(){
        window.hi_subscription = new Subscription();
    }


    Subscription.prototype.mouseover = function(event){
        if(!event&&!event.target){
            return;
        }
        
        event.preventDefault();

        var btn = $(event.target);
        btn.addClass("hover");

        if(btn.data("state")=="subscribed"){
          btn.html("Unsubscribe?")
        }
    }
    Subscription.prototype.mouseout = function(event){
        if(!event&&!event.target){
            return;
        }
        
        event.preventDefault();

        var btn = $(event.target);
        btn.removeClass("hover");
        if(btn.data("state")=="subscribed"){
          btn.html('<span>&#10003;</span> Subscribed');
        }
    }
    Subscription.prototype.click = function(event){
        if(!event&&!event.target){
            return;
        }
        
        event.preventDefault();

        var that    = this,
            btn     = $(event.target),
            subType = btn.data("sub-type"),
            url,
            object_value;

        if(btn.attr("rel")&&btn.attr("rel")=="auth"){
          return;
        }

        btn.mouseover();

        switch(subType){
            case 'user':
                object_value = btn.data('username');
                var dt = { username: object_value }
                if(btn.data("force_subscribe")){
                    dt.force_subscribe = 1;
                }
                url = Routing.generate('person_subscription_toggle', dt);
                break;
            case 'topic':
                object_value = btn.data('topic');
                url = Routing.generate('topic_subscription_toggle', { slug: object_value });
                break;
            case 'place':
                object_value = btn.data('city')+" / "+btn.data('country');
                url = Routing.generate('place_subscription_toggle', { city: btn.data('city'), country: btn.data('country') });
                break;
            default:
                return;
                break;
        }
        
        this.setButtonIdleState(btn, true);

        $.ajax({
          url: url,
          type: "POST",
          dataType: "json",
          cached: false
        }).done(function(msg) {
          if (msg && msg.status == 'success') {
            var s = msg.subscriptionStatus;
            btn
              .attr('data-state', s == 'subscribed' ? 'subscribed' : 'unsubscribed')
              .data('state', s == 'subscribed' ? 'subscribed' : 'unsubscribed')
              .html(s == 'subscribed' ? '<span>&#10003;</span> Subscribed' : 'Subscribe')
              .mouseout()
            ;

            that.setButtonSubState(btn, msg.subscriptionStatus);

            Analytics.get().trackSubscribeButton( msg.subscriptionStatus, subType, object_value, btn );
          }
          that.setButtonIdleState(btn, false);
        }).always(function(){
            btn.trigger("_hi_action_completed");
        });
    }

    Subscription.prototype.subscribetoallfb = function(event){
        if(!event&&!event.target){
            return;
        }
        
        event.preventDefault();

        var that = this,
            btn  = $(event.target);

        btn.innerload()
        $.ajax({
          url: Routing.generate('person_subscribe_all_facebook', {username: window.current_user.username_canonical}),
          type: "POST",
          dataType: "json",
          cached: false
        }).done(function(msg) {
          if (msg && msg.error == false) {
            var a, user, button;
            for(a in msg.added_users){
                user = msg.added_users[a];
                button = $('*[data-username="'+user.username+'"]');
                that.setButtonSubState(button, "subscribed");
            }

            Analytics.get().trackSubscribeAllFbButton( msg.added_users.length, btn );

            var alertbox = ['<div class="container alerts"><div class="row"><div class="alert-box success">',
            "You’ve connected with all your friends. Woot!",
            '</div></div></div>'].join("");
            $("#alertsContainer").html(alertbox);
            $(".container.alerts").css("top", "0px");
            setTimeout(function(){
                $(".container.alerts").fadeOut(400);
            }, 15000);
          }
          
          btn.innerload("destroy")
          if(btn.transition){
              btn.transition({opacity: 0}, 200, "ease", function(){
                btn.hide();
              });
          }
        });
    }

    Subscription.prototype.setButtonIdleState = function(button, state){
        if(state){
            button.prop("disabled", true).html(button.data('state') != 'subscribed' ? 'Subscribing' : 'Unsubscribing')
            if(!button.hasClass("small")){
              button.innerload();
            }
        }else{
            button.prop("disabled", false)
            button.innerload("destroy");
        }
        return this;
    }

    Subscription.prototype.setButtonSubState = function(button, state){
        state = state.toLowerCase();
        button
            .attr('data-state', state)
            .data('state', state)
            .html(state == 'subscribed' ? '<span>&#10003;</span> Subscribed' : 'Subscribe')
            .mouseout();
        return this;
    }


    return Subscription;
})()
