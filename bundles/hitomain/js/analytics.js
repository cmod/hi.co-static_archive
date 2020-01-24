

(function(){

    window.Analytics = (function(){
        var _instance, _Analytics;
        function Analytics(){

        }

        Analytics.get = function() {
          // var a;
          // a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          // _instance != null ? _instance : _instance = (function(func, args, ctor) {
          //   ctor.prototype = func.prototype;
          //   var child = new ctor, result = func.apply(child, args);
          //   return Object(result) === result ? result : child;
          // })(_Analytics, a, function(){});

          // _instance.clearCallback();
          // return _instance;
          return new _Analytics();
        };

        _Analytics = (function(){
            var _tracking_callback;

            function _Analytics(){
                this.mixpanel = window.mixpanel ? window.mixpanel : this.getFakeMixpanel()
            }

            _Analytics.prototype.clearCallback = function(){
                this._tracking_callback = null;
                return this;
            }

            _Analytics.prototype.callback = function( cb ){
                this._tracking_callback = cb;
                return this;
            }

            _Analytics.prototype.trackSubscribeButton = function( status, type, object_name, target ){
                var event_name, params;
                event_name = status.toLowerCase() == "subscribed" ? "Subscribe" : "Unsubscribe";

                params = $.extend({
                    object_type:    type, 
                    object_name:    object_name, 
                    path:           this.getCleanPathname()
                }, this.getDefaultParameters());

                if(target&&target.data){
                    $.extend( params, this.extractParameters(target) );
                }

                return this.track(event_name, params);
            }

            _Analytics.prototype.trackSubscribeAllFbButton = function( how_many, target ){
                var event_name, params;
                event_name = "Subscribe to All Facebook Friends";

                params = $.extend({
                    how_many:       how_many,
                    path:           this.getCleanPathname()
                }, this.getDefaultParameters());

                if(target&&target.data){
                    $.extend( params, this.extractParameters(target) );
                }

                this.track(event_name, params);
            }

            _Analytics.prototype.trackThanksButton = function( hasMessage, target ){
                var event_name, params;
                event_name = "Thanks";

                params = $.extend({
                    hasMessage:    hasMessage
                }, this.getDefaultParameters());

                if(target&&target.data){
                    $.extend( params, this.extractParameters(target) );
                }

                return this.track(event_name, params);
            }

            _Analytics.prototype.trackTmmButton = function( target ){
                var event_name, params;
                event_name = "Tell Me More";

                params = $.extend({}, this.getDefaultParameters());

                if(target&&target.data){
                    $.extend( params, this.extractParameters(target) );
                }

                return this.track(event_name, params);
            }

            _Analytics.prototype.trackRegister = function( target ){
                var event_name, params;
                event_name = "User Registration";

                params = $.extend({}, this.getDefaultParameters());

                if(target&&target.data){
                    $.extend( params, this.extractParameters(target) );
                }

                return this.track(event_name, params);
            }

            _Analytics.prototype.trackLogin = function( target ){
                var event_name, params;
                event_name = "User Login";

                params = $.extend({}, this.getDefaultParameters());

                if(target&&target.data){
                    $.extend( params, this.extractParameters(target) );
                }

                return this.track(event_name, params);
            }

            _Analytics.prototype.trackAuthAction = function( type, action ){
                var event_name, params;
                event_name = type; 
                if(action){
                    event_name += " via " + action;
                }

                params = $.extend({}, this.getDefaultParameters());

                return this.track(event_name, params);
            }


            _Analytics.prototype.trackNewSketch = function( sharing ){
                var event_name, params;
                event_name = "New Sketch";

                params = {}
                if(sharing&&sharing.twitter){
                    params.twitter = 1;
                }
                if(sharing&&sharing.facebook){
                    params.facebook = 1;
                }
                params = $.extend(params, this.getDefaultParameters());

                return this.track(event_name, params);
            }
            _Analytics.prototype.trackExtentionPublished = function( sharing ){
                var event_name, params;
                event_name = "Moment Extended";

                params = {}
                if(sharing&&sharing.twitter){
                    params.twitter = 1;
                }
                if(sharing&&sharing.facebook){
                    params.facebook = 1;
                }
                params = $.extend(params, this.getDefaultParameters());

                return this.track(event_name, params);
            }


            _Analytics.prototype.trackNewSketch = function( ){
                var event_name, params;
                event_name = "New Sketch";

                params = $.extend({}, this.getDefaultParameters());

                return this.track(event_name, params);
            }



            _Analytics.prototype.getDefaultParameters = function(path){
                return {
                    route: $("body").data("route"),
                    path: this.getCleanPathname(),
                }
            }

            _Analytics.prototype.extractParameters = function(target){
                if(!target.data){ 
                    return {}; 
                }
                var params = {}, data= target.data()
                for(a in data){
                    a = a.replace(/([a-z](?=[A-Z]))/g, '$1-').toLowerCase()
                    if(a.indexOf("track-")==0){
                        a = a.split("track-").join("")
                        params[ a ] = target.data( "track-"+a );
                    }
                }
                return params;
            }

            _Analytics.prototype.getCleanPathname = function(){
                return window&&window.location&&window.location.pathname ? (function(path){
                    if(path.toLowerCase().indexOf("/app_dev.php")>-1){
                        path = path.split("/app_dev.php").join("")
                    }
                    return path
                })(window.location.pathname) : "N/A";
            }
            
            _Analytics.prototype.log = function(){
                if(console&&console.info){
                    console.info.apply(console, arguments);
                }
            }

            _Analytics.prototype.guessPageName = function(path){
                if(document&&document.title){
                    return document.title;
                }
                if(path=="/"){
                    return "top page";
                }
            }

            _Analytics.prototype.track = function(event_name, params){
                this.log("tracking", event_name, params);
                try{
                    var that = this,
                        timeoutId;
                    this.mixpanel.track(event_name, params, function(){
                        that.log("tracking success", event_name);
                        if( timeoutId ){ clearTimeout( timeoutId ); };
                        if( that._tracking_callback ){
                            try{
                                that.log("tracking callback", event_name);
                                that._tracking_callback( {success: true, event_name: event_name, params: params} );
                            }catch(error){
                                that.log("Something wrong happened with the Analytics calback. Please take a look.", that)
                            }
                        }
                    });
                    timeoutId = setTimeout(function(){
                        that.log("tracking timeout", event_name);
                        if( that._tracking_callback ){
                            try{
                                that.log("tracking timeout callback", event_name);
                                that._tracking_callback( {success: false, event_name: event_name, params: params} );
                            }catch(error){
                                that.log("Something wrong happened with the Analytics calback. Please take a look.", that)
                            }
                        }
                    }, 3000)
                }catch(error){
                    this.log("tracking failed", event_name);
                    if( this._tracking_callback ){
                        try{
                            this._tracking_callback( {success: false} );
                        }catch(error){}
                    }
                }
                return this;
            }

            _Analytics.prototype.getFakeMixpanel = function(){
                var call = function(c){
                    if(console&&console.warn){
                        console.warn("MIXPANEL DOESN'T EXIST, ACTION UN TRACKED!")
                    }
                    if(c){
                        setTimeout(function(){
                            try{
                                c();
                            }catch(error){}
                        },10)
                    }
                }
                return {
                    init: function(){call();},
                    push: function(){call();},
                    disable: function(){call();},
                    track: function(a,b,c){call(c);},
                    track_pageview: function(){call();},
                    track_links: function(){call();},
                    track_forms: function(){call();},
                    register: function(){call();},
                    register_once: function(){call();},
                    unregister: function(){call();},
                    identify: function(){call();},
                    get_distinct_id: function(){call();},
                    name_tag: function(){call();},
                    set_config: function(){call();},
                    get_config: function(){call();},
                    get_property: function(){call();},
                    people: {
                        set: function(){call();},
                        set_once: function(){call();},
                        increment: function(){call();},
                        append: function(){call();},
                        track_charge: function(){call();},
                        clear_charges: function(){call();},
                        delete_user: function(){call();}
                    }
                }
            }

            return _Analytics;

        })()
        return Analytics;
    })()

})()