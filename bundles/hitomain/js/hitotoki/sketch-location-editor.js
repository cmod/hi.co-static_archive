$(function(){

    var base_element = $(".sketchLocationEditor"),
        map_element = base_element.find(".edit-map"),
        search_form  = base_element.find("form"),
        search_field = base_element.find(".searchfield"),
        cancel = base_element.find(".cancel"),
        done   = base_element.find(".done"),
        open_link = $(".open_edit_location_link"),
        geocoder = new google.maps.Geocoder(),
        map,
        marker,
        save,
        xhr_request,
        reverse_and_save,
        cleanGeolocResult,
        map_options;

    open_link.click(function(e){
      e.preventDefault()
      base_element.slideDown({
        complete: function(){
          google.maps.event.trigger(map, 'resize');
        }
      });
      if($(window).width()>639){
        var body = $("html, body");
        body.animate({scrollTop:0}, '500', 'swing');
      }

      $(".map_icon").hide();

    });

    cancel.click(function(e){
      e.preventDefault()
      if(xhr_request && xhr_request.abort){
        xhr_request.abort()
      }
      done.text("wait...").prop("disabled", false).text("Done").innerload("kill");
      base_element.slideUp()
      $(".map_icon").show();
    });

    // this is the callback that will change the location itself
    reverse_and_save = function(lat, lng){
      HI.Controller.Geolocation.reverseGeocode(lng, lat, function (result) {
        save({
          lat: result.original_latitude,
          lng: result.original_longitude,
          city: result.city,
          alias: result.alias,
          country: result.country,
          coordinates: result.geometry.location.lng() + ',' + result.geometry.location.lat(),
          formatted_address: result.formatted_address,
          geo_data: JSON.stringify(result)
        });
      });

      // geocoder.geocode(
      //   {'latLng': new google.maps.LatLng(lat, lng)},
      //   function(results, status) {
      //     cr =  cleanGeolocResult(results, status);
      //     location_data.city    = cr.city
      //     location_data.country = cr.country

      //     save(location_data);
      //   }
      // )
    }

    save = function(u_data){
      console.info("ready to save", u_data);

      $.ajax({
          url: $(".open_edit_location_link").data("url"),
          //url: "/api/moments/"+window.current_sketch.id,
          contentType: 'application/json',
          dataType: 'json',
          type: "PATCH",
          data: JSON.stringify(u_data)
      }).done(function(data){

        console.info("done saving", data ); 
        if(data&&data.meta&&data.meta.data&&data.meta.data.place){
          $(".header_profile .place-link").text(data.meta.data.place.name+", "+data.meta.data.place.country).attr("href", data.meta.data.place.url);
        }

        done.text("wait...").prop("disabled", false).text("Done");
        base_element.slideUp()
        $(".map_icon").show();

        //window.location.reload();
        window.current_sketch.coordinates = {
            lat: u_data.lat,
            lng: u_data.lng
        };



      }).fail(function(){
        console.info("problem saving...");

        done.text("wait...").prop("disabled", false).text("Done");
        base_element.slideUp()
        $(".map_icon").show();
      })

    }

    done.click(function(){
      done.text("wait...").prop("disabled", true).innerload();
      reverse_and_save( marker.getPosition().lat(), marker.getPosition().lng() );
    })

    // Now, create the map
    map_options = {
      center: new google.maps.LatLng( window.current_sketch.coordinates.lat, window.current_sketch.coordinates.lng ),
      zoom: 12,
      scrollwheel: false,
      zoomControl: true,
      panControl: false,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.TOP_LEFT
      },
      mapTypeControl: false,
      // overviewMapControl: true,
      // mapTypeId: google.maps.MapTypeId.ROADMAP,
      // disableDefaultUI: true,
      // scaleControl: true,
      // streetViewControl: false
    };
    map = map_element.hitomap(map_options);

    $(window).resize(function(){
      google.maps.event.trigger(map, 'resize');
    })

    // Then, the marker
    marker = $().hitomap("addMarker", map, {
      lat: window.current_sketch.coordinates.lat,
      lng: window.current_sketch.coordinates.lng,
    });
    marker.setDraggable(true);
    // google.maps.event.addListener(marker, 'dragend', function(){
    //   // reverse geocode the location marker.lat marker.lng
    //   reverse_and_presave( marker.getPosition().lat(), marker.getPosition().lng() )
    // })

    google.maps.event.addListener(map, 'click', function(e){
      // map.setCenter(e.latLng)
      marker.setPosition(e.latLng)
    })
    var idl = google.maps.event.addListener(map, 'idle', idl = function(e){
      base_element.css({
        right: "0px",
        display: "none"
      })
      google.maps.event.removeListener(idl);
    })


    search_form.submit(function(e){
      if(e && e.preventDefault)
        e.preventDefault()

        geocoder.geocode({'address': search_field.val()}, function(results, status){
            if(status == google.maps.GeocoderStatus.OK){
              map.setCenter(results[0].geometry.location)
              marker.setPosition(results[0].geometry.location)
            }else{
              console.info("not found");
            }
          }
        )
    });

});