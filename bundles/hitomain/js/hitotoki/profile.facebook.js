(function(window){
    var LaunchFBButtons;
    $(function(){
        if(window.FB_IS_READY){
            new LaunchFBButtons();
        }else{
            window.fbready = function(){
                new LaunchFBButtons();
            }
        }
    });

    LaunchFBButtons = (function(){
        function LaunchFBButtons(){
            this.initBtns();
        }

        LaunchFBButtons.prototype.getLoginStatus = function(){
            var that = this;
            FB.getLoginStatus(function(response) {
                if(response.status == "connected"){
                    that.authResponse = response.authResponse;
                }
                that.initBtns();    
            });
        }

        LaunchFBButtons.prototype.initBtns = function(){
            var that = this;

            $("#facebookLogout").click( function(e){
                if(e&&e.preventDefault){e.preventDefault();};

                var button = $(this);
                button.prop("enabled", false);

                that.logout(e);
            } );

            $("#facebookLogin").click(function(e){
                if(e&&e.preventDefault){e.preventDefault();};

                var button = $(this);
                button.prop("enabled", false);

                FB.login(function(response) {
                    button.prop("enabled", true);
                    
                    if (response.authResponse) {
                        that.authResponse = response.authResponse;
                        that.login();
                    }else{
                        alert("Oops, An Error occured with Facebook... We'll look into that!");
                    }
                },{scope: $("#facebookLogin").data("permissions")});
            });
        }


        LaunchFBButtons.prototype.logout = function(e){
            if(e&&e.preventDefault){e.preventDefault();};

            $.ajax({
                url: $("#facebookLogout").data("action"),
                method: "get",
            }).always(function(){
                window.location.reload();
            })
        }

        LaunchFBButtons.prototype.login = function(e){
            if(e&&e.preventDefault){e.preventDefault();};

            $.ajax({
                url: $("#facebookLogin").data("action"),
                method: "post",
                data: this.authResponse
            }).done(function(data){
                window.location.reload();
            })
        }
        

        return LaunchFBButtons;
    })()
})(this)


