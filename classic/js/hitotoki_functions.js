// 8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8
// HITOTOKI hitotoki functions javascript toomfoolery
// (c) hitotoki.org MMVII
// Little mama, please don't steal our codez
// 8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8
//
//
var isloaded = false;

// - - - - - - - - - - - - - - -  
// FUNCTION swapFeatured(x)
//
// Whazzit? : Swap out the featured article data
//
function swapFeatured(x) {
	// Pull out the reference to the Featured Article Bit
	var featured = document.getElementById("featured_story");

	// Build the new Featured Article HTML via article_id reference (x)
	var newHTML = '<div class="featured_poster"><span class="issue_no"><a href="'+ hitotokiData[x].url +'">'+ hitotokiData[x].issue +'</a></span><a href="'+ hitotokiData[x].url +'"><img src="' + hitotokiData[x].img + '" width="163" height="217" alt="' + hitotokiData[x].location + '" /></a></div>';
	newHTML += '<h2>&ldquo;<a href="'+ hitotokiData[x].url +'">' + hitotokiData[x].title + '</a>&rdquo;</h2>';
	newHTML += '<p>' + hitotokiData[x].author + ' <!--from ' + hitotokiData[x].homeland + '--><br />'+ hitotokiData[x].inaton +' '+ hitotokiData[x].location +'</p></div>';
			
	// Write the new HTML
	featured.innerHTML = newHTML;
}

// - - - - - - - - - - - - - - -  
// FUNCTION highlightThumb(x)
//
// Whazzit? : highlight the currently selected image thumbnail
//
function highlightThumb(x) {
	var thumblist = document.getElementById("story_by_image");
	for (var i=0; i < thumblist.childNodes.length; i++) {
		if (thumblist.childNodes[i].id == "thumb_"+x) {
			thumblist.childNodes[i].style.border = "1px solid #4d743d";
		}
		else if (thumblist.childNodes[i].nodeType == "1") {
			thumblist.childNodes[i].style.border = "1px solid #eee";
		}
	}

}

// - - - - - - - - - - - - - - -  
// FUNCTION featuredEntry(title, author, lat, lng, url, img, homeland, location, issue, inaton)
//
// Whazzit? : build the featuredEntry array located in includes/hitotokiData.js
//
function featuredEntry(title, author, lat, lng, url, img, homeland, location, issue, inaton) {
	this.title = title;
	this.author = author;
	this.lat = lat;
	this.lng = lng;
	this.url = url;
	this.img = img;
	this.homeland = homeland;
	this.location = location;
	this.issue = issue;
	this.inaton = inaton;
}

// - - - - - - - - - - - - - - -  
// FUNCTION updateSelected(x, id)
//
// Whazzit? : 	updated the mousedovered thumb
//				if the map isn't loaded just update the featured item and highlight the thumb
//
function updateSelected(x, id) {
	// Where x is article_id from EE
	// id is the marker ID
	swapFeatured(x);
	highlightThumb(x);

	if (isloaded) {			// Check to see if the google map is loaded or not
		moveMap(x, id);
	}
}