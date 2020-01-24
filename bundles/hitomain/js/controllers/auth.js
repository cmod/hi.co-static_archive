HI.Controller.Auth = (function(){
    /* Private methods */
    var $win;

    $win = $(window);

    /* ************************* */
    /* ************************* */
    /* ************************* */

    function Auth(){
        var view, register, login;

        view  = new Auth.View();
        view.on("open_auth", function(target){
            register    = new Auth.RegisterForm( $("#AuthRegisterForm") );
            login       = new Auth.LoginForm( $("#AuthLoginForm") );

            register.on("auth_success", function(new_account){
                if(new_account){
                    window.Analytics.get().trackRegister( target )
                }else{
                    window.Analytics.get().trackLogin( target )
                }

                view.killAuthLink()
                Auth.treatTarget( target, new_account );
            })
            login.on("auth_success", function(){
                window.Analytics.get().trackLogin( target )

                view.killAuthLink()
                Auth.treatTarget( target );
            })
            login.on("fb_not_found", function(){
                register.element.find(".fbbutton").click();
                view.showRegister()
            })

            view.show()
        });
        view.on("close_auth", function(){
            register.destroy();
            register    = null;

            login       = null;

            view.close()
        });


    }


    /* ************************* */
    /* ************************* */
    /* ************************* */



    Auth.RegisterForm = (function(){
        var onFacebookLogin;
        function RegisterForm(elem){
            _.extend(this, EventsDispatcher);
            this.element = elem;

            this.element.on("submit", _.bind(this.submit, this))
            this.element.find(".fbbutton").click( _.bind(this.facebook, this) )

            this.element.find(".fbbutton").show();
            this.element.find(".fbfeedback").remove();

            this.element.find(".fbbutton").show().prop("disabled", false).css("opacity", 1);
            this.element.find(".fbfeedback").remove();
        }

        RegisterForm.prototype.submit = function(e){
            if(e&&e.preventDefault){e.preventDefault()}
            var that = this,
                jqXHR,
                timeoutId;

            this.element.find('button.submit').prop("disabled", true).innerload()
            jqXHR = $.ajax({
                method:     "post",
                url:        Routing.generate('api_post_user'),
                data:       JSON.stringify(this.serialize())
            }).always(function(e){
                clearTimeout(timeoutId);
            }).fail(function(e){
                var data = e.responseJSON;
                that.element.find('button.submit').prop("disabled", false).innerload("close");

                if(data && data.errors){
                    that.element.find('.error').empty().hide();
                    _.each(_.keys(data.errors), function(a,b){
                        that.element.find('.'+a+'Errors').html( data.errors[a].join("<br/>") ).show();
                        console.info(data.errors[a])
                    })
                }
                
            }).done(function(e){

                that.trigger("auth_success", (e&&e.data&&e.data.user)?e.data.user:undefined);
                //that.element.find('button.submit').prop("disabled", false).innerload("close");

            })

            timeoutId = setTimeout(function(){
                if(jqXHR && jqXHR.abort){
                    jqXHR.abort();
                    that.element.find('button.submit').prop("disabled", false).innerload("close");
                    alert("Oops, it looks like we had some server glitches... Please try again.");
                }
            }, 10000);

        }

        RegisterForm.prototype.serialize = function(){
            var d = {
                first_name: $("#AuthRegisterFirst").val(),
                last_name: $("#AuthRegisterLast").val(),
                username: $("#AuthRegisterUsername").val(),
                email: $("#AuthRegisterEmail").val(),
                plain_password: $("#AuthRegisterPassword").val(),
                has_accepted_terms: $("#AuthRegisterTerms").prop("checked")
            };
            if(this.facebook_info){
                d.facebook = {
                    id: this.facebook_info.id,
                    access_token: this.facebook_info.accessToken
                }
            }
            return d;

        }

        RegisterForm.prototype.reportErrors = function(errors){

        }

        RegisterForm.prototype.facebook = function(e){
            if(e&&e.preventDefault){e.preventDefault()}

            var that = this;
            that.element.find(".fbbutton").prop("disabled", true).css("opacity", "0.3");
            HI.Controller.Auth.FacebookBridge.getInfo(function(response){
                that.facebook_info = response;
                that.checkFbUser(function(isHiUser, isFbUser){
                    if(isHiUser && isFbUser){
                        that.trigger("auth_success")
                    }
                    if(!isHiUser && !isFbUser){
                        alert("something went wrong with facebook, sorry about that...");
                        that.element.find(".fbbutton").prop("disabled", false).css("opacity", "1");
                    }
                    if(!isHiUser && isFbUser){
                        that.autofill({
                            username: response.username?response.username.split(".").join(""):"",
                            first_name: response.first_name,
                            last_name: response.last_name,
                            email: response.email
                        });
                        that.element.find(".fbbutton").hide();
                        that.addFacebookFeedback(response);
                    }
                })
                
                
            }, function(){
                that.element.find(".fbbutton").prop("disabled", false).css("opacity", "1");
            })
        }

        RegisterForm.prototype.checkFbUser = function( callback ){
            var that = this;
            $.ajax({
                method: "post",
                url: Routing.generate('api_post_session'),
                data: JSON.stringify({
                    username: this.facebook_info.id,
                    plain_password: this.facebook_info.accessToken,
                    is_facebook: true
                })
            }).fail(function(e){
                if(e.status==404){
                    callback(false, true)
                }else{
                    callback(false, false)
                }
            }).done(function(e){
                callback(true, true)
            })
        }

        RegisterForm.prototype.addFacebookFeedback = function(response){
            /* 
              <div class="socialprofile fbprofile loading">
                <img src="" />
                <span class="name"></span>
              </div>
            */
            var cont = $("<div></div>").addClass("socialprofile fbprofile fbfeedback");
            cont.append('<img src="https://graph.facebook.com/'+response.id+'/picture?with=200&height=200" />');
            cont.append('<br /><span class="regmessage">Fill in password below to complete registration.</span>');
            this.element.find(".fbbutton").after(cont);
        }

        RegisterForm.prototype.autofill = function(data){
            if(data.username){
                $("#AuthRegisterUsername").val(data.username);
            }
            if(data.first_name){
                $("#AuthRegisterFirst").val(data.first_name);
            }
            if(data.last_name){
                $("#AuthRegisterLast").val(data.last_name);
            }
            if(data.email){
                $("#AuthRegisterEmail").val(data.email);
            }
            $("#AuthRegisterPassword").focus();
        }

        RegisterForm.prototype.destroy = function(){
            this.element.off("submit");
            this.element.find(".fbbutton").off( "click" );
            $("#AuthRegisterFirst").val("")
            $("#AuthRegisterLast").val("")
            $("#AuthRegisterUsername").val("")
            $("#AuthRegisterEmail").val("")
            $("#AuthRegisterPassword").val("")
            $("#AuthRegisterTerms").prop("checked", false)
        }
        

        return RegisterForm;
    })()



    /* ************************* */
    /* ************************* */
    /* ************************* */



    Auth.LoginForm = (function(){
        function LoginForm(elem){
            _.extend(this, EventsDispatcher);
            this.element = elem;

            this.element.find(".fbbutton").click( _.bind(this.facebook, this) )
            this.element.on("submit", _.bind(this.submit, this));

        }

        LoginForm.prototype.submit = function(e){
            if(e&&e.preventDefault){ e.preventDefault(); };

            var d = {
                username: $("#AuthLoginUsername").val(),
                plain_password: $("#AuthLoginPassword").val(),
                is_facebook: false
            }, that = this;

            this.element.find('button.submit').prop("disabled", true).innerload()
            $.ajax({
                method: "post",
                url: Routing.generate('api_post_session'),
                data: JSON.stringify(d)
            }).fail(function(e){
                that.element.find('button.submit').prop("disabled", false).innerload("close")
                that.showError("Error: Please check your username and password.");
            }).done(function(e){
                that.trigger("auth_success");
            })
        }

        LoginForm.prototype.showError = function(error_message){
            this.element.find(".globalErrors").empty().text(error_message).show()
        }

        LoginForm.prototype.facebook = function(e){
            if(e&&e.preventDefault){e.preventDefault()}
            this.element.find('.fbbutton').innerload();

            var that = this;
            that.element.find(".fbbutton").prop("disabled", true).css("opacity", "0.3");
            HI.Controller.Auth.FacebookBridge.getToken(function(response){
                var d = {
                    username: response.userID,
                    plain_password: response.accessToken,
                    is_facebook: true
                }
                
                $.ajax({
                    method: "post",
                    url: Routing.generate('api_post_session'),
                    data: JSON.stringify(d)
                }).fail(function(e){
                    if(e.status==404){
                        that.trigger("fb_not_found");
                    }else{
                        alert("somethig went wronf with facebook, sorry about that...");
                    }
                    that.element.find(".fbbutton").prop("disabled", false).css("opacity", "1").innerload("close");;
                }).done(function(e){
                    that.trigger("auth_success");
                    that.element.find(".fbbutton").prop("disabled", false).css("opacity", "1").innerload("close");;
                })
                
            }, function(){
                alert("Something went wrong with facebook, sorry about that...")
                that.element.find(".fbbutton").prop("disabled", false).css("opacity", "1").innerload("close");;
            })
        }        

        return LoginForm;
    })()


    /* ************************* */
    /* ************************* */
    /* ************************* */



    Auth.FacebookBridge = (function(){

        function FacebookBridge(){

        }

        FacebookBridge.getToken = function(callback, error){
            if(error == undefined){
                error = function(){}
            }
            FB.getLoginStatus( function(response){
                if (response.status === 'connected') {
                    callback(response.authResponse)
                } else {
                    FB.login(function(response){
                        if (response.authResponse) {
                            callback(response.authResponse)
                        }else{
                            error()
                        }
                    }, {scope: "email, user_about_me, user_location, publish_actions, user_friends"})
                }
            })
        }

        FacebookBridge.getInfo = function(callback, error){
            FacebookBridge.getToken(function(authToken){
                FB.api('/me', {}, function(response) {
                    callback( _.extend(authToken, response) );
                });
            }, function(){
                error()
            })
        }

        return FacebookBridge;
    })()



    /* ************************* */
    /* ************************* */
    /* ************************* */


    Auth.View = (function(){
        /* private methods */
        var initEvents,
            triggerOpen,
            triggerOpenBinded,
            createBackground,
            removeBackground,
            lookForEscape;

        function View(){
            _.extend(this, EventsDispatcher);
            triggerOpenBinded = _.bind(triggerOpen, this);

            initEvents.apply(this);
        }

        View.prototype.show = function(){
            createBackground.apply(this);
            $(".auth-box-cover").transition({
                opacity: 1
            }, 500, 'ease');
            $(".auth-box-container").show();
            $(".auth-box-container").css({opacity: 0, y: "50px"}).transition({
                opacity: 1,
                y: "0px"
            }, 500, 'ease', function(){
                if(!window.isMobile.any()){
                    $("#AuthRegisterEmail").focus()
                }
            });
            $(".auth-toggle").click( _.bind(this.toggle, this) );

            $("body").css("overflow", "hidden");
        }

        View.prototype.close = function(){
            $(".auth-box-container").find("*").off();
            $(".auth-box-cover").transition({
                opacity: 0
            }, 500, 'ease', removeBackground);
            $(".auth-box-container").css({opacity: 1}).transition({
                opacity: 0,
                y: "-50px"
            }, 500, 'ease', function(){
              $(".auth-box-container").hide();  
            });

            $("body").css("overflow", "auto");

        }

        View.prototype.toggle = function(e){
            if(e&&e.preventDefault){ e.preventDefault(); };

            $(".register-box").fadeToggle();
            $(".login-box").fadeToggle();

            if(!window.isMobile.any()){
                setTimeout(function(){
                    if($(".register-box").css("display")=="none"){
                        $("#AuthLoginUsername").focus()
                    }else{
                        $("#AuthRegisterEmail").focus()
                    }
                        
                }, 100);
            }
        }

        View.prototype.showRegister = function(e){
            if(e&&e.preventDefault){ e.preventDefault(); };

            $(".register-box").fadeIn();
            $(".login-box").fadeOut();

            if(!window.isMobile.any()){
                setTimeout(function(){
                    $("#AuthRegisterEmail").focus()
                }, 100);
            }
        }
        View.prototype.showLogin = function(e){
            if(e&&e.preventDefault){ e.preventDefault(); };

            $(".register-box").fadeOut();
            $(".login-box").fadeIn();

            if(!window.isMobile.any()){
                setTimeout(function(){
                    $("#AuthLoginUsername").focus()
                }, 100);
            }
        }

        View.prototype.killAuthLink = function(){
            $('button[rel="auth"], a[rel="auth"]').off( "click", triggerOpenBinded  ).attr("rel", null);
            $('form[rel="auth"]').off( "submit", triggerOpenBinded  ).attr("rel", null);
        }

        initEvents = function(){
            $('button[rel="auth"], a[rel="auth"]').on("click", triggerOpenBinded );
            $('form[rel="auth"]').on("submit", triggerOpenBinded );
        };

        triggerOpen = function(e){
            if(e&&e.preventDefault){ e.preventDefault(); };

            var that,
                lookForEscape,
                execute;

            that = this;
            execute = function(){
                
                lookForEscape = _.bind( function(e){
                    if (e.keyCode == 27) {
                        $win.off("keyup", lookForEscape )
                        this.trigger("close_auth", e.currentTarget)
                    }
                }, that);

                $win.on("keyup", lookForEscape )
                $(".close_auth").on("click", function(e){
                    that.trigger("close_auth", e.currentTarget);
                })

                that.trigger("open_auth", e.currentTarget)
            }    

            if($(e.currentTarget).hasClass("auth_delay")){
                setTimeout(function(){
                    execute();
                }, 600);
            }else{
                execute();
            }   




        };

        createBackground = function(){
            removeBackground();
            var that = this;
            $("body")
                .append($("<div></div>")
                    .addClass("auth-box-cover")
                    .on("click", function(e){
                        if(e&&e.preventDefault){e.preventDefault();};
                        that.trigger("close_auth");
                    })
                )

        };

        removeBackground = function(){
            $(".auth-box-cover").off().remove();
        };


        return View;
    })()


    Auth.treatTarget = (function(){
        function treatTarget(target, new_account){
            target = $(target);
            target.data("force_subscribe", 1);
            target.on("_hi_action_completed", function(){
                var callback, analytics, type, action;

                callback = function(){
                    console.info("callback callback callback")
                    if(new_account && new_account.username){
                        try{
                            window.location.href = Routing.generate('hitotoki_welcome');
                        }catch(exception){
                            window.location.reload();
                        }
                    }else{
                        window.location.reload();
                    }
                };
                
                type = (new_account && new_account.username) ? "Register" : "Login";
                if(target.hasClass("subscription_button"))      action = "Subscribe";
                if(target.hasClass("tell_me_more_button"))      action = "Tell Me More";
                if(target.attr("id")=="tell_me_more_button")    action = "Tell Me More";
                if(target.attr("id")=="sketch_thanks_form")     action = "Thanks";

                window.Analytics.get().callback( callback ).trackAuthAction( type, action );
            })

            if(target.hasClass("subscription_button") || target.hasClass("tell_me_more_button") || target.attr("id")=="tell_me_more_button"){
                target.trigger("click");
            }else if(target.attr("id")=="sketch_thanks_form"){
                target.trigger("submit");
            }else{
                if(new_account && new_account.username){
                    try{
                        window.location.href = Routing.generate('hitotoki_welcome');
                    }catch(exception){
                        window.location.reload();
                    }
                }else{
                    window.location.reload();
                }
            }
            
            
        }

        return treatTarget;
    })()
    
    return Auth;
})(this)