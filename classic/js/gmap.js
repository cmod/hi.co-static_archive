// 8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8
// HITOTOKI gmap javascript toomfoolery
// (c) hitotoki.org MMVII
// Big poppa, please don't steal our codez
// 8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8
//
// - - - - - - - - - - - - - - -  
// Globals
	var map;
	var point;
	var allPoints = new Array();
	var x=0;
	var isloaded = false;

	var marker;					// Our mail marker variable
	var lastMarkerId;			// ID of last clicked marker
	var hasClicked = false;		// If user has clicked, true
	var hasZoomed = false;		// If map has been zoomed, true

	var thumblist2 = document.getElementById("story_by_image");

// - - - - - - - - - - - - - - -  
// Icons
//
// Unselected hitotoki Icon
	var icon;
	icon = new GIcon();
	icon.image = "https://hitotoki.org/classic/img/marker_off.png";
	icon.shadow = "https://hitotoki.org/classic/img/marker_shadow.png";
	icon.iconSize = new GSize(24, 24);
	icon.shadowSize = new GSize(30, 24);
	icon.iconAnchor = new GPoint(12, 35);
	icon.infoWindowAnchor = new GPoint(23, 1);
	
	var iconActive;
	iconActive = new GIcon();
	iconActive.image = "https://hitotoki.org/classic/img/marker_on.png";
	iconActive.shadow = "https://hitotoki.org/classic/img/marker_shadow.png";
	iconActive.iconSize = new GSize(24, 24);
	iconActive.shadowSize = new GSize(30, 24);
	iconActive.iconAnchor = new GPoint(12, 35);
	iconActive.infoWindowAnchor = new GPoint(23, 1);

// - - - - - - - - - - - - - - -  
// FUNCTION load()
//
// Whazzit? : 	Load the google map data -- called once
// 				the page is loaded from <body>
//
function load(id, issue) {
      if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("hitotoki_map"));
        //map.addControl(new GSmallMapControl());
        map.addControl(new customZoomControl());
		//map.addControl(new GMapTypeControl());
		map.setCenter(new GLatLng(35.68686, 139.751587), 10);
		map.setMapType(G_PHYSICAL_MAP);
		
		for (var i=0; i < indexLookUp.length; i++) {
			var cur = indexLookUp[i];
			var issuenumber = hitotokiData[cur].issue;
			
			point = new GLatLng(hitotokiData[cur].lat, hitotokiData[cur].lng);
			map.addOverlay(createMarker(point, cur, icon, issuenumber));
		}

		
	}
	isloaded = true;
	updateSelected(id, issue);		// Move the map and update thumbnails to correspond to first feature
}

// - - - - - - - - - - - - - - -  
// FUNCTION createMarker(point, number, icon, issue)
//
// Whazzit? : 	
function createMarker(point, number, icon, issue) {
	//var marker = new GMarker(point, icon);
	var marker = new PdMarker(point, icon);
	
	marker.setId(issue);
	marker.setTooltip(hitotokiData[number].location);
	marker.setOpacity(100);
	
	GEvent.addListener(marker, "click", function() {
		updateSelected(number, issue);
	});
	
	
	GEvent.addListener(marker, "mouseover", function() {
		marker.setImage(iconActive.image); // change graphic
		marker.topMarkerZIndex(); // bring marker to top
		}); 
	
	GEvent.addListener(marker, "mouseout", function() {
		if (lastMarkerId != issue) {
			marker.restoreImage(icon.image);
			marker.restoreMarkerZIndex();
		}
		});
	
	
	return marker;
}

// ---------------------------------------
// move the hitotoki map based on 
// article_id x
//
function moveMap(x, id) {
	var marker = map.getMarkerById(id);
	
	// - - - - - - - - - - - - - - - - - - - - \\
	// Turn off all other tooltips and
	// turn on this marker's tooltip
	var omarker = map.getFirstMarker();
	while (omarker != null)
	{
		if(omarker != marker) {
			omarker.setTooltipHiding(true);
			omarker.hideTooltip();
		}
		omarker = map.getNextMarker();
	}
	marker.setTooltipHiding(false);
	marker.showTooltip();
	// - - - - - - - - - - - - - - - - - - - - //
	
	if(hasClicked) {
		var lastMarker = map.getMarkerById(lastMarkerId);
		lastMarker.restoreMarkerZIndex();
		lastMarker.setImage(icon.image);
	}
	
	point = new GLatLng(hitotokiData[x].lat, hitotokiData[x].lng);
	if (!hasZoomed) {
		map.setZoom(11);
		hasZoomed = true;
	}

	marker.setImage(iconActive.image);
	marker.topMarkerZIndex();

	map.panTo(point);
	lastMarkerId = id;
	hasClicked = true;
}

// A TextualZoomControl is a GControl that displays textual "Zoom In"
// and "Zoom Out" buttons (as opposed to the iconic buttons used in
// Google Maps).
function customZoomControl() {
}

// - - - - - - - - - - - - -
// Cutstom Controls ...
//		
customZoomControl.prototype = new GControl();

// Creates a one DIV for each of the buttons and places them in a container
// DIV which is returned as our control element. We add the control to
// to the map container and return the element for the map class to
// position properly.
customZoomControl.prototype.initialize = function(map) {
	var container = document.createElement("div");
	
	// --------------------
	// Zoom In
	//
	var zoomInDiv = document.createElement("div");
	this.setButtonStyle_(zoomInDiv);
	container.appendChild(zoomInDiv);

	var imgelement = document.createElement("img");
	imgelement.setAttribute("src", "https://hitotoki.org/classic/img/zoom_in.png");

	zoomInDiv.appendChild(imgelement);
	GEvent.addDomListener(zoomInDiv, "click", function() {
		map.zoomIn();
		hasZoomed = true;
	});
	
	// --------------------
	// Zoom Out
	//
	var zoomOutDiv = document.createElement("div");
	this.setButtonStyle_(zoomOutDiv);
	container.appendChild(zoomOutDiv);

	var imgelement = document.createElement("img");
	imgelement.setAttribute("src", "https://hitotoki.org/classic/img/zoom_out.png");
	zoomOutDiv.appendChild(imgelement);
	GEvent.addDomListener(zoomOutDiv, "click", function() {
		map.zoomOut();
		hasZoomed = true;
	});
	
	map.getContainer().appendChild(container);
	return container;
}

// By default, the control will appear in the top left corner of the
// map with 7 pixels of padding.
customZoomControl.prototype.getDefaultPosition = function() {
	return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(7, 7));
}

// Sets the proper CSS for the given button element.
customZoomControl.prototype.setButtonStyle_ = function(button) {
  //button.style.textDecoration = "underline";
  //button.style.color = "#0000cc";
  //button.style.backgroundColor = "white";
  //button.style.font = "small Arial";
  //button.style.border = "1px solid black";
  button.style.padding = "2px";
  //button.style.marginBottom = "3px";
  button.style.textAlign = "center";
  // button.style.width = "6em";
  button.style.cursor = "pointer";
}

