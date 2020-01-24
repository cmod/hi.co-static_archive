HI.Controller.Geolocation = (function() {
  var options = {
      statusElement: '#geolocation-city-country'
  };

  function getGeolocation(callback) {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
              reverseGeocode(position.coords.longitude, position.coords.latitude, function (geocodedLocation) {
                callback(geocodedLocation);
              });
          }, function(error) {
              console.log("Error occurred. Error code: " + error.code);
              if (error.code == 0) {
                  alert("Geolocation failed for unknown reasons!");
              }
              if (error.code == 1) {
                  alert("Permission denied while trying to get your location.");
              }
              if (error.code == 2) {
                  alert("Could not retrieve your location! Please check if Geolocation is enabled.");
              }
              if (error.code == 3) {
                  alert("Timed out while trying to get your location.");
              }

              callback(null);

              // error.code can be:
              //   0: unknown error
              //   1: permission denied
              //   2: position unavailable (error response from locaton provider)
              //   3: timed out
          }, { enableHighAccuracy: true, maximumAge: 60000 });
          // // If the position changes update it
          // var watch = navigator.geolocation.watchPosition(function(position) {
          //     updateLocation(position);
          // });
      } else {
          console.log('Geolocation is not supported for this Browser/OS version yet.');
          callback(null);
      }
  }

  function reverseGeocode(longitude, latitude, callback) {

      var geocodedLocation = {
        original_longitude: longitude,
        original_latitude: latitude,
        route: null,
        neighborhood: null,
        sublocality: null,
        sublocality_level_1: null,
        sublocality_level_2: null,
        sublocality_level_3: null,
        sublocality_level_4: null,
        sublocality_level_5: null,
        locality: null,
        postal_town: null,
        administrative_area_level_3: null,
        administrative_area_level_2: null,
        administrative_area_level_1: null,
        city: null,
        alias: null,
        country: null,
        geometry: null
      };

      // Reverse geocode
      geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(latitude, longitude);
      geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK && status != google.maps.GeocoderStatus.ZERO_RESULTS) {
            var geometry = {};
            for (var j = 0; j < results.length; j++) {
                var result = results[j];
                if (result['types'] && jQuery.inArray('country', result['types']) == -1) {
                  geometry[result['types'][0]] = result['geometry'];
                }
                for (var i = 0; i < result['address_components'].length; i++) {
                    var component = result['address_components'][i];
                    if (geocodedLocation.route == null && jQuery.inArray('route', component['types']) != -1) {
                        geocodedLocation.route = component['long_name'];
                    } else if (geocodedLocation.neighborhood == null && jQuery.inArray('neighborhood', component['types']) != -1) {
                        geocodedLocation.neighborhood = component['long_name'];
                    } else if (geocodedLocation.sublocality == null && jQuery.inArray('sublocality', component['types']) != -1) {
                        geocodedLocation.sublocality = component['long_name'];
                    } else if (geocodedLocation.sublocality_level_1 == null && jQuery.inArray('sublocality_level_1', component['types']) != -1) {
                        geocodedLocation.sublocality_level_1 = component['long_name'];
                    } else if (geocodedLocation.sublocality_level_2 == null && jQuery.inArray('sublocality_level_2', component['types']) != -1) {
                        geocodedLocation.sublocality_level_2 = component['long_name'];
                    } else if (geocodedLocation.sublocality_level_3 == null && jQuery.inArray('sublocality_level_3', component['types']) != -1) {
                        geocodedLocation.sublocality_level_3 = component['long_name'];
                    } else if (geocodedLocation.sublocality_level_4 == null && jQuery.inArray('sublocality_level_4', component['types']) != -1) {
                        geocodedLocation.sublocality_level_4 = component['long_name'];
                    } else if (geocodedLocation.sublocality_level_5 == null && jQuery.inArray('sublocality_level_5', component['types']) != -1) {
                        geocodedLocation.sublocality_level_5 = component['long_name'];
                    } else if (geocodedLocation.locality == null && jQuery.inArray('locality', component['types']) != -1 ||
                        jQuery.inArray('postal_town', component['types']) != -1) {
                        geocodedLocation.locality = component['long_name'];
                    } else if (geocodedLocation.administrative_area_level_3 == null && jQuery.inArray('administrative_area_level_3', component['types']) != -1) {
                        geocodedLocation.administrative_area_level_3 = component['long_name'];
                    } else if (geocodedLocation.administrative_area_level_2 == null && jQuery.inArray('administrative_area_level_2', component['types']) != -1) {
                        geocodedLocation.administrative_area_level_2 = component['long_name'];
                    } else if (geocodedLocation.administrative_area_level_1 == null && jQuery.inArray('administrative_area_level_1', component['types']) != -1) {
                        geocodedLocation.administrative_area_level_1 = component['long_name'];
                    } else if (geocodedLocation.country == null &&  jQuery.inArray('country', component['types']) != -1) {
                        geocodedLocation.country = component['long_name'];
                    }
                }
            }

            // Get city from available data
            if (geocodedLocation.locality) {
                geocodedLocation.city = geocodedLocation.locality;
                if (geometry.locality) {
                  geocodedLocation.geometry = geometry.locality;
                } else {
                  geocodedLocation.geometry = geometry.postal_town;
                }
            } else if (geocodedLocation.administrative_area_level_3) {
                geocodedLocation.city = geocodedLocation.administrative_area_level_3;
                geocodedLocation.geometry = geometry.administrative_area_level_3;
            } else if (geocodedLocation.administrative_area_level_2) {
                geocodedLocation.city = geocodedLocation.administrative_area_level_2;
                geocodedLocation.geometry = geometry.administrative_area_level_2;
            } else if (geocodedLocation.administrative_area_level_1) {
                geocodedLocation.city = geocodedLocation.administrative_area_level_1;
                geocodedLocation.geometry = geometry.administrative_area_level_1;
            } else if (geocodedLocation.sublocality) {
                geocodedLocation.city = geocodedLocation.sublocality;
                geocodedLocation.geometry = geometry.sublocality;
            } else if (geocodedLocation.neighborhood) {
                geocodedLocation.city = geocodedLocation.neighborhood;
                geocodedLocation.geometry = geometry.neighborhood;
            } else if (geocodedLocation.route) {
                geocodedLocation.city = geocodedLocation.route;
                geocodedLocation.geometry = geometry.route;
            }

            console.log(geometry);
            console.log(geocodedLocation);
            // If no geometry get the best possible geometry
            if (!geocodedLocation.geometry) {
                console.log(geometry);
                for(g in geometry){
                  console.log(g);
                  if (!g) {
                    geocodedLocation.geometry = g;
                  }
                }
            }

            // Tokyo drift
            var wards = new Array('adachi', 'arakawa', 'bunkyo', 'bunkyō', 'chiyoda', 'chuo', 'chūō', 'edogawa', 'itabashi', 'katsushika', 'kita', 'koto', 'kōtō', 'meguro', 'minato', 'nakano', 'nerima', 'ota', 'ōta', 'setagaya', 'shibuya', 'shinjuku', 'shinagawa', 'suginami', 'sumida', 'taito', 'taitō', 'toshima');
            for(ward in wards){
                if(wards[ward].toString() == geocodedLocation.city.toLowerCase()){
                    if (geocodedLocation.administrative_area_level_3) {
                        if (geocodedLocation.administrative_area_level_3.toLowerCase() == 'tokyo') {
                            geocodedLocation.alias = geocodedLocation.city;
                            geocodedLocation.city = 'Tokyo';
                        }
                    }
                    if (geocodedLocation.administrative_area_level_2) {
                        if (geocodedLocation.administrative_area_level_2.toLowerCase() == 'tokyo') {
                            geocodedLocation.alias = geocodedLocation.city;
                            geocodedLocation.city = 'Tokyo';
                        }
                    }
                    if (geocodedLocation.administrative_area_level_1) {
                        if (geocodedLocation.administrative_area_level_1.toLowerCase() == 'tokyo') {
                            geocodedLocation.alias = geocodedLocation.city;
                            geocodedLocation.city = 'Tokyo';
                        }
                    }
                }
            }
            geocodedLocation.formatted_address = results[0]['formatted_address'];
        } else {
            console.log("Geocoder failed due to: " + status);
            if ('ZERO_RESULTS' == status) {
              geocodedLocation.city = "Somewhere";
              geocodedLocation.country = "High Seas";
              geocodedLocation.formatted_address = "Somewhere, High Seas";
              geocodedLocation.geometry = { location: {
                lat: function () {
                  return -25.209911213827674;
                },
                lng: function () {
                  return 79.27734375;
                }
                }
              };
            }
        }

        callback(geocodedLocation);
    });
  }

  return {
    initGeolocation: getGeolocation,
    reverseGeocode: reverseGeocode
  };
}());