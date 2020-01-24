(function (window, $, google) {
    window.HitoLocalizer = (function(){
        var _instance, HitoLocalizer, _HitoLocalizer;

        HitoLocalizer = {
            get: function(){
                if(!_instance)
                    _instance = new _HitoLocalizer();

                return _instance;
            },

            // shortcuts
            geocode: function(lat, lng){
                return HitoLocalizer.get().geocode(lat, lng);
            },
            geolocation: function(){
                return HitoLocalizer.get().geolocation();
            },
            cleanGeolocResult: function(results, status){
                return HitoLocalizer.get().cleanGeolocResult(results, status);
            }
        }
        




        // private
        function _HitoLocalizer()
        {
            this.geocoder = new google.maps.Geocoder();
        }

        _HitoLocalizer.prototype.geocode = function(lat, lng){
            var that = this;
            return $.Deferred(function($deferred) {
                that.geocoder.geocode(
                    {'latLng': new google.maps.LatLng(lat, lng)}, 
                    function(results, status) {
                        if(status=="OK"){
                            $deferred.resolve({
                                status: status,
                                error:   null,
                                results: results
                            });
                        }else{
                            $deferred.reject({
                                status: 'error',
                                error:   status,
                                results: null
                            });
                        }
                    }
                )
            }).promise();
        }

        _HitoLocalizer.prototype.geolocation = function(){
            return $.Deferred(function($deferred) {
                if(navigator && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        $deferred.resolve({
                            status: 'success',
                            location: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                spot: position.address.city && position.address.countryCode ? position.address.city + ', ' + position.address.countryCode : null
                            }
                        });
                    }, function(error) {
                        if(error.code === 1) {
                            error = 'You didn\'t share your location.';
                        } else if(error.code === 2) {
                            error = 'Couldn\'t detect your current location.';
                        } else if(error.code === 3) {
                            error = 'Retrieving position timed out.';
                        } else {
                            error = 'Unknown error.';
                        }

                        $deferred.reject({
                            status: 'error',
                            error: message,
                            location: null
                        });
                    }, { maximumAge: 0, timeout: 60000, enableHighAccuracy: true });
                } else {
                    $deferred.reject({
                    status: 'error',
                    error: 'Your browser doesn\'t support geolocation!',
                    location: null
                    });
                }
            }).promise();
        }

        _HitoLocalizer.prototype.cleanGeolocResult = function(results, status){
            var geocodedLocation = [],
              cleandata = {}
              camelcase = function(w){
                var c = w.split("_");
                for(var i=1; i<c.length; i++){
                  c[i] = c[i].charAt(0).toUpperCase() + c[i].slice(1);
                }
                return c.join("");
              };

            cleandata.place = {};   console.info( results ) ;
            if (status == google.maps.GeocoderStatus.OK && status != google.maps.GeocoderStatus.ZERO_RESULTS) {

              for (var j = 0; j < results.length; j++) {
                  var result = results[j];
                  
                  for (var i = 0; i < result['address_components'].length; i++) {
                      var component = result['address_components'][i];

                      if(component['types'].length>0){
                        if(!geocodedLocation[camelcase(component['types'][0])]){
                          geocodedLocation[camelcase(component['types'][0])] = component['long_name'];
                          cleandata.place[camelcase(component['types'][0])] = component['long_name'];
                        }
                      }
                      

                      // if (geocodedLocation['route'] == undefined && jQuery.inArray('route', component['types']) != -1) {
                      //     geocodedLocation['route'] = component['long_name'];
                      //     cleandata.place.route = component['long_name'];
                      // } else if (geocodedLocation['neighborhood'] == undefined && jQuery.inArray('neighborhood', component['types']) != -1) {
                      //     geocodedLocation['neighborhood'] = component['long_name'];
                      //     cleandata.place.neighborhood = component['long_name'];
                      // } else if (geocodedLocation['sublocality'] == undefined && jQuery.inArray('sublocality', component['types']) != -1) {
                      //     geocodedLocation['sublocality'] = component['long_name'];
                      //     cleandata.place.sublocality = component['long_name'];
                      // } else if (geocodedLocation['locality'] == undefined && jQuery.inArray('locality', component['types']) != -1 || jQuery.inArray('postal_town', component['types']) != -1) {
                      //     geocodedLocation['locality'] = component['long_name'];
                      //     cleandata.place.locality = component['long_name'];
                      // } else if (geocodedLocation['administrativeAreaLevel3'] == undefined && jQuery.inArray('administrative_area_level_3', component['types']) != -1) {
                      //     geocodedLocation['administrativeAreaLevel3'] = component['long_name'];
                      //     cleandata.place.administrativeAreaLevel3 = component['long_name'];
                      // } else if (geocodedLocation['administrativeAreaLevel2'] == undefined && jQuery.inArray('administrative_area_level_2', component['types']) != -1) {
                      //     geocodedLocation['administrativeAreaLevel2'] = component['long_name'];
                      //     cleandata.place.administrativeAreaLevel2 = component['long_name'];
                      // } else if (geocodedLocation['administrativeAreaLevel1'] == undefined && jQuery.inArray('administrative_area_level_1', component['types']) != -1) {
                      //     geocodedLocation['administrativeAreaLevel1'] = component['long_name'];
                      //     cleandata.place.administrativeAreaLevel1 = component['long_name'];
                      // } else if (geocodedLocation['country'] == undefined &&  jQuery.inArray('country', component['types']) != -1) {
                      //     geocodedLocation['country'] = component['long_name'];
                      //     cleandata.place.country = component['long_name'];
                      // }
                  }
              };


              // Get city from available data
              if (geocodedLocation['locality']) {
                  geocodedLocation['city'] = geocodedLocation['locality'];
              } else if (geocodedLocation['administrativeAreaLevel3']) {
                  geocodedLocation['city'] = geocodedLocation['administrativeAreaLevel3'];
              } else if (geocodedLocation['administrativeAreaLevel2']) {
                  geocodedLocation['city'] = geocodedLocation['administrativeAreaLevel2'];
              } else if (geocodedLocation['administrativeAreaLevel1']) {
                  geocodedLocation['city'] = geocodedLocation['administrativeAreaLevel1'];
              } else if (geocodedLocation['sublocality']) {
                  geocodedLocation['city'] = geocodedLocation['sublocality'];
              } else if (geocodedLocation['neighborhood']) {
                  geocodedLocation['city'] = geocodedLocation['neighborhood'];
              } else if (geocodedLocation['route']) {
                  geocodedLocation['city'] = geocodedLocation['route'];
              } else {
                  geocodedLocation['city'] = 'Somewhere';
              }

              var wards = new Array('adachi', 'arakawa', 'bunkyo', 'bunkyō', 'chiyoda', 'chuo', 'chūō', 'edogawa', 'itabashi', 'katsushika', 'kita', 'koto', 'kōtō', 'meguro', 'minato', 'nakano', 'nerima', 'ota', 'ōta', 'setagaya', 'shibuya', 'shinjuku', 'shinagawa', 'suginami', 'sumida', 'taito', 'taitō', 'toshima');

              for(ward in wards){
                  if(wards[ward].toString() == geocodedLocation['city'].toLowerCase()){
                      if (typeof geocodedLocation['administrativeAreaLevel3'] !== 'undefined') {
                          if (geocodedLocation['administrativeAreaLevel3'].toLowerCase() == 'tokyo') {
                              geocodedLocation['city'] = 'Tokyo';
                          }
                      }
                      if (typeof geocodedLocation['administrativeAreaLevel2'] !== 'undefined') {
                          if (geocodedLocation['administrativeAreaLevel2'].toLowerCase() == 'tokyo') {
                              geocodedLocation['city'] = 'Tokyo';
                          }
                      }
                      if (typeof geocodedLocation['administrativeAreaLevel1'] !== 'undefined') {
                          if (geocodedLocation['administrativeAreaLevel1'].toLowerCase() == 'tokyo') {
                              geocodedLocation['city'] = 'Tokyo';
                          }
                      }
                  }
              }

              cleandata.city = geocodedLocation['city'];
              cleandata.country = cleandata.place.country;

              if(geocodedLocation['administrativeAreaLevel1']){
                cleandata.region = geocodedLocation['administrativeAreaLevel1'];
              }

              geocodedLocation['formattedAddress'] = results[0]['formatted_address'];
              cleandata.formattedAddress = results[0]['formatted_address']

              cityCountry = geocodedLocation['city']+', <em>'+geocodedLocation['country']+'</em>';
              cleandata.citycountry = geocodedLocation['city']+', <em>'+geocodedLocation['country']+'</em>';

              return cleandata;

            } else {
              if ('ZERO_RESULTS' == status) {
                  geocodedLocation['city'] = 'Somewhere';
                  geocodedLocation['country'] = 'High Seas';
                  cityCountry = geocodedLocation['city']+', '+geocodedLocation['country'];
                  cleandata.citycountry = geocodedLocation['city'];
              }
              return cleandata;
            }
        }

        return HitoLocalizer;
    })();
})(window, window.jQuery, window.google);