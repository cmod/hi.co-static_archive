(function ($, google) {
    var openInfobox; // Used to close the open infobox
    var methods = {
        renderMap: function (options) {
            var styles = [
            // v.4
            { "elementType": "labels.text.fill", "stylers": [   { "color": "#6e6f62" } ] },
            { "featureType": "water", "elementType": "geometry.fill", "stylers": [   { "color": "#61dbee" } ] },
            { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [   { "color": "#f7f6f0" } ] },
            { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ {"color":"#6e6f62"} ] },
            { "featureType": "road", "elementType": "geometry", "stylers": [   { "visibility": "simplified" } ] },
            { "featureType": "road", "elementType": "geometry", "stylers": [   { "color": "#ffffff" } ] },
            { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [   { "color": "#ffffff" } ] },
            { "featureType": "road", "elementType": "labels.icon", "stylers": [   { "saturation": -88 },   { "hue": "#aaff00" },   { "gamma": 1.42 } ] },
            { "featureType": "road", "elementType": "labels.text.fill", "stylers": [   { "color": "#abaaa7" } ] },
            { "featureType": "poi.park", "elementType": "geometry", "stylers": [   { "visibility": "simplified" },   { "color": "#a6e3c8" } ] },
            { "featureType": "poi.school", "elementType": "geometry.fill", "stylers": [   { "visibility": "off" }, { "color": "#ffa5a4" } ] },
            { "featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [   { "color": "#dddfd3" },   { "visibility": "on" },   { "gamma": 1.31 } ] },
            { "featureType": "poi.place_of_worship", "elementType": "labels.icon", "stylers": [   { "gamma": 1.45 } ] },
            { "featureType": "poi.park", "elementType": "labels.icon", "stylers": [   { "gamma": 1.28 } ] },
            { "featureType": "poi.business", "elementType": "geometry.fill", "stylers": [   { "color": "#dddfd3" }, { "gamma": 1.31 } ] },

            { "featureType": "poi.government", "elementType": "geometry", "stylers": [   { "color": "#dddfd3" } ] },
            { "featureType": "poi", "elementType": "labels.icon", "stylers": [ { "saturation": -67 }, { "lightness": 54 }, { "gamma": 0.98 }, { "visibility": "simplified" } ] },
            { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [   { "color": "#6e6f62" } ] },
            { "featureType": "transit", "stylers": [   { "saturation": -54 },   { "gamma": 1.26 } ] },
            { "featureType": "transit", "elementType": "labels.icon", "stylers": [ { "gamma": 1.42 }, { "lightness": 50 } ] },
            { "featureType": "transit.line", "elementType": "geometry", "stylers": [   { "color": "#babbad" } ] },
            { "featureType": "transit", "stylers": [   { "visibility": "simplified" } ] },
            { "featureType": "transit", "elementType": "labels.text", "stylers": [   { "visibility": "on" } ] },
            { "featureType": "transit.station", "elementType": "geometry.fill", "stylers": [   { "visibility": "on" },   { "color": "#dddfd3" },   { "gamma": 1.31 } ] },
            { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "visibility": "on" }, { "color": "#abaaa7" } ]},
            { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [   { "visibility": "on" },   { "color": "#babbad" },   { "gamma": 1.22 } ] },
            { "featureType": "poi.business", "elementType": "labels.icon", "stylers": [   { "visibility": "off" } ] },
            { "featureType": "poi", "stylers": [   { "visibility": "off" } ] }
            ];

            var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});
            var default_options = {
                center: new google.maps.LatLng(-34.397, 150.644),
                zoom: 4,
                scrollwheel: false,
                panControl: false,
                zoomControlOptions: { style: google.maps.ZoomControlStyle.SMALL },
                mapTypeControl: false,
                overviewMapControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false
            };
            options = options || {}
            $.extend(default_options, options)
            options = default_options

            // Needs the DOM object and not the jQuery object. http://stackoverflow.com/questions/5862365/displaying-a-google-maps-that-shows-the-chosen-address
            var map = new google.maps.Map(this.get(0), options);
            map.mapTypes.set('map_style', styledMap);
            map.setMapTypeId('map_style');

            return map;
        },

        // Helper function to reduce template code
        addMarkerWithInfobox: function (map, sketch, isOnlyImage, callback) {
            var marker = methods.addMarker.call(this, map, { lat: sketch.coordinates.lat , lng: sketch.coordinates.lng });
            var infobox = methods.addInfobox.call(this, marker, map, sketch, isOnlyImage);

            var latlng = new google.maps.LatLng(sketch.coordinates.lat, sketch.coordinates.lng);

            if( !map.allmarkers ){
                map.allmarkers = []
            }
            map.allmarkers.push(marker);
            if( !map.allinfoboxes ){
                map.allinfoboxes = {}
            }
            map.allinfoboxes[map.allmarkers.length-1] = infobox;

            callback.call(this, marker, infobox);
        },

        addMarker: function (map, options) {
            var image = new google.maps.MarkerImage('/bundles/hitomain/images/hitopin_retina2.png', new google.maps.Size(18, 24), new google.maps.Point(0,0), new google.maps.Point(9, 12), new google.maps.Size(18, 24));
            var shadow = new google.maps.MarkerImage("/bundles/hitomain/images/shadow-hitopin_retina.png", new google.maps.Size(32.0, 24.0), new google.maps.Point(0, 0), new google.maps.Point(10, 19), new google.maps.Size(32, 24));
            var latlng = new google.maps.LatLng(options.lat, options.lng);
            var marker = new google.maps.Marker({
                position: latlng,
                map: map,
                icon: image,
                shadow: shadow
            });
            if( !map.allmarkers ){
                map.allmarkers = []
            }
            map.allmarkers.push(marker);

            return marker;
        },

        addInfobox: function (marker, map, sketch, isOnlyImage, options) {
            var content =  renderHtmlContent(sketch, isOnlyImage);
            if (options === undefined || options === null) {
                var options = {
                    disableAutoPan: false,
                    content: content,
                    maxWidth: 0,
                    pixelOffset: new google.maps.Size(-30, -70),
                    zIndex: 1000,
                    boxStyle: {
                        width: "auto"
                    },
                    infoBoxClearance: new google.maps.Size(10, 105),
                    isHidden: true,
                    pane: "floatPane",
                    enableEventPropagation: false,
                    closeBoxURL: ""
                };
            }

            var infobox = new InfoBox(options);

            google.maps.event.addListener(marker, 'click', function() {
                methods.showInfoBox.call(this, infobox, marker, map);
            });

            return infobox;
        },

        showInfoBox: function (infobox, marker, map, doNotPan) {
            // Close any open infobox
            if (openInfobox !== undefined) {
                openInfobox.setVisible(false);
            }
            infobox.open(map, marker);
            infobox.setVisible(true);
            openInfobox = infobox;

            map.panTo(marker.getPosition());

            if(map.allmarkers){
                var a, mrkr;
                for(a in map.allmarkers){
                    mrkr = map.allmarkers[a];
                    mrkr.setIcon( new google.maps.MarkerImage('/bundles/hitomain/images/hitopin_retina2.png', new google.maps.Size(18, 24), new google.maps.Point(0,0), new google.maps.Point(9, 12), new google.maps.Size(18, 24)) )
                }
                marker.setIcon( new google.maps.MarkerImage('/bundles/hitomain/images/hitopin_retina2_hover.png', new google.maps.Size(18, 24), new google.maps.Point(0,0), new google.maps.Point(9, 12), new google.maps.Size(18, 24)) )
            }
        },
        centerMapToBounds: function(map){
            function getZoomByBounds( map, bounds ){
                var MAX_ZOOM = map.mapTypes.get( map.getMapTypeId() ).maxZoom || 21 ;
                var MIN_ZOOM = map.mapTypes.get( map.getMapTypeId() ).minZoom || 0 ;

                var ne= map.getProjection().fromLatLngToPoint( bounds.getNorthEast() );
                var sw= map.getProjection().fromLatLngToPoint( bounds.getSouthWest() ); 

                var worldCoordWidth = Math.abs(ne.x-sw.x);
                var worldCoordHeight = Math.abs(ne.y-sw.y);

                //Fit padding in pixels 
                var FIT_PAD = 40;

                for( var zoom = MAX_ZOOM; zoom >= MIN_ZOOM; --zoom ){ 
                  if( worldCoordWidth*(1<<zoom)+2*FIT_PAD < $(map.getDiv()).width() && 
                      worldCoordHeight*(1<<zoom)+2*FIT_PAD < $(map.getDiv()).height() ){
                        return zoom;
                  }
                      
                }
                return 0;
            }
            
            if(map.allmarkers.length == 0){
                return;
            }

            if(map.allmarkers.length == 1){
                map.setCenter( map.allmarkers[0].getPosition(), 12 );
                return map;
            }

            if(map.allmarkers.length >=2){
                var bounds;
                console.info("markers:", map.allmarkers.length)
                bounds = new google.maps.LatLngBounds(map.allmarkers[0].getPosition(), map.allmarkers[0].getPosition())
                for(var i=2; i<map.allmarkers.length; i++){
                    bounds.extend( map.allmarkers[i].getPosition() );
                }
                console.info("zoom:", getZoomByBounds(map, bounds))
                map.setCenter( bounds.getCenter(), 1 );
                map.setZoom( getZoomByBounds(map, bounds)  );
                //map.setCenter( bounds.getCenter(), getZoomByBounds(map, bounds) );
                return map;
            }
            
        }
        
    };

    $.fn.hitomap = function (method) {
        // Method calling logic
        if (methods[method]) {
          return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
          return methods.renderMap.apply(this, arguments);
        } else {
          $.error('Method ' +  method + ' does not exist on jQuery.hitomap' );
        }
    }

    function renderHtmlContent (sketch, isOnlyImage) {
        // Check whether to render only image or text
        isOnlyImage = (isOnlyImage === undefined || isOnlyImage === false) ? false : true;

        var infobox = document.createElement("div");
        if (isOnlyImage) {
            // Display only the image in the infobox

            if (sketch.image && sketch.momentPage) {
                var image = sketch.image.medium;
                infobox.style.cssText = "background: none repeat scroll 0 0 #FFFFFF; border: 0px solid #1c3456; width: 100px; height: 100px; overflow: hidden; padding: 0px; border-radius: 0px; color: #33332b; position: absolute; box-shadow: 0px 1px 4px rgba(0,0,0,0.7); left: -20px; top: -50px;";
                htmlContent = "<a href=\""+sketch.url+"\"><img src="+image+" class=\"inline_map_image_small\" /></a>";
            } else if (sketch.image && !sketch.momentPage) {
                var image = sketch.image.medium;
                infobox.style.cssText = "background: none repeat scroll 0 0 #FFFFFF; border: 0px solid #1c3456; width: 250px; height: 150px; overflow: hidden; padding: 0px; border-radius: 0px; color: #33332b; position: absolute; box-shadow: 0px 1px 4px rgba(0,0,0,0.7); left: -95px; top: -95px;";
                htmlContent = "<a href=\""+sketch.url+"\"><img src="+image+" class=\"inline_map_image\" /></a>";
            } else {
                var image = sketch.user.profileImage;
                infobox.style.cssText = "background: none repeat scroll 0 0 #FFFFFF; border: 0px solid #1c3456; width: 100px; height: 100px; overflow: hidden; padding: 0px; border-radius: 0px; color: #33332b; position: absolute; box-shadow: 0px 1px 4px rgba(0,0,0,0.7); left: -25px; top: -45px;";
                htmlContent = "<a href=\""+sketch.url+"\"><img src="+image+" class=\"inline_map_profile\" /></a>";
            }

        } else {
            // Display text in the infobox
            var textClass = 'moment_text';
            if (sketch.isJapanese) {
                textClass = textClass + ' ja';
            }
            infobox.style.cssText = "background: none repeat scroll 0 0 #fff; border: 1px solid #c4c4bc; padding: 10px 5px; padding-bottom: 3px; border-radius: 3px; color: #33332b; position: absolute; left: -90px; top: -85px; width:225px; height: 130px; text-align: center; overflow: hidden; box-shadow: 0px 3px 8px rgba(152,152,144,0.3);";
            htmlContent = "<a href=\""+sketch.url+"\"><div class=\"mapmoment\"><h4>"+sketch.place.city+", <strong> "+sketch.place.country+"</strong></h4><p class=\""+textClass+"\">"+sketch.text+"</p></div></a>";
        }
        infobox.innerHTML = htmlContent;

        return infobox;
    }
})(window.jQuery, window.google);
