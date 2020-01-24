/*
 * var map = new HI.UI.Map({container: element});
 *
 * map.addSketch(s);
 * map.addSketches(array);
 *
 */

HI.UI.Map = function(options) {

  this.map = $('#'+options.containerId).hitomap();
  this.sketches = [];

};

HI.UI.Map.prototype = (function() {

  var MAP_MAX_ZOOM = 4;

  function renderSketches(sketches) {
    if (!sketches) {
      throw new Error("Sketches in array expected");
    }
    var self = this;
    this.sketches = this.sketches.concat(sketches);
    for (var i=0; i<this.sketches.length; i++) {
      var sketch = this.sketches[i];
      $().hitomap('addMarkerWithInfobox', this.map, sketch, false, function(marker, infobox) {
        _hoverSketchEntry.call(self, sketch.place.cityId, marker, infobox);
      });
    };
  }

  function focusLocation(placeId) {
    $('#place_'+placeId).trigger('mouseover');
  }

  function _hoverSketchEntry(cityId, marker, infobox) {
    var self = this;
    $('#place_'+cityId).on('mouseover', function() {
      _smoothZoom(self.map.getZoom());
      // TODO: fix active class
      $().hitomap('showInfoBox', infobox, marker, self.map);
    });
  }

  function _smoothZoom(count) {
    if (count >= MAP_MAX_ZOOM) {
      return;
    } else {
      var self = this;
      var z = google.maps.event.addListener(map, 'zoom_changed', function(event){
        google.maps.event.removeListener(z);
        _smoothZoom(count + 1);
      });
      setTimeout(function(){self.map.setZoom(count)}, 80);
    }
  }

  return {
    renderSketches: renderSketches,
    focusLocation: focusLocation
  };
}());

