HI.Controller.PersonIndex = (function() {

  // Dependencies: HI.UI.Map

  var map;

  function init() {
    map = new HI.UI.Map({
      containerId: 'hitotoki_map-profile'
    });
  }

  return {
    init: init,
    getMap: function() {
      return map;
    }
  }
}());
