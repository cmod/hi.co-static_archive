

// hitotokiData.js
// Craig Mod, April 2007
// 
// Dynamically generated map data for hitotoki.org
//

// function declaration: featuredEntry(title, author, lat, lng, url, img, location, issue) 
// This file must be loded after the hitotoki gmap.js
//


// Our index lookup for the google map
var indexLookUp = new Array();
indexLookUp.push("307");
indexLookUp.push("300");
indexLookUp.push("181");
indexLookUp.push("266");
indexLookUp.push("226");
indexLookUp.push("179");
indexLookUp.push("161");
indexLookUp.push("123");
indexLookUp.push("149");
indexLookUp.push("52");


// Our hitotoki data for the featured section
var hitotokiData = new Array();
hitotokiData[307] = new featuredEntry("Dewy eyes closed, her porcelain arms and legs splayed attractively", "Lindsay Lueders", 35.703258, 139.580076, "/classic/tokyo/033", "/classic/images/hitotoki/featured/hitotoki-tokyo-33-home.jpg", "Minnesota", "the Inokashira line, car 4, Kichijoji station", "033", "on ");
hitotokiData[300] = new featuredEntry("The <em>ika</em> had made too many turns.", "Edamame", 35.661236, 139.699445, "/classic/tokyo/032", "/classic/images/hitotoki/featured/ika-nigiri_163.jpg", "Tokyo", "a kaiten sushi shop (now gone)", "032", "in");
hitotokiData[181] = new featuredEntry("A tongue was moving around my big toe, like a warm slug crawling.  ", "Hakanai", 35.68693, 139.686527, "/classic/tokyo/031", "/classic/images/hitotoki/featured/hitotoki-tokyo-31-home.jpg", "Scotland", "a karaoke box near the Hachiko exit of Shibuya station", "031", "in");
hitotokiData[266] = new featuredEntry("Ichor will gush out of this carefully constructed image", "Daniel Snyder", 35.699318, 139.771449, "/classic/tokyo/030", "/classic/images/hitotoki/featured/hitotoki-tokyo-30-home.png", "the USA", "an unnamed anime and games shop", "030", "outside");
hitotokiData[226] = new featuredEntry("I wince, more than her.", "Jason Gray", 35.737138, 139.650017, "/classic/tokyo/029", "/classic/images/hitotoki/featured/hitotoki-jasongray-home.jpg", "the UK", "the 7-11 at the intersection of Mejiro-dori and Senkawa-dori", "029", "in front of");
hitotokiData[179] = new featuredEntry("Their schoolbags were puddled around their socks, forgotten", "Selena Hoy", 35.540636, 139.448999, "/classic/tokyo/028", "/classic/images/hitotoki/featured/hitotoki_e_selena_home.jpg", "USA", "the arch in HaraMachida", "028", "under");
hitotokiData[161] = new featuredEntry("Amongst the bottles and the obscure records and the crimson velvet walls", "Reuben Stanton", 35.703553, 139.579225, "/classic/tokyo/027", "/classic/images/hitotoki/featured/hitotoki_e_reuben_home.jpg", "Australia", "a jazz bar in Kichijoji", "027", "in");
hitotokiData[123] = new featuredEntry("Nostalgia isn’t an easy indulgence for amateurs", "Darryl Wee", 35.654282, 139.720945, "/classic/tokyo/026", "/classic/images/hitotoki/featured/tokyo-nostalgia_is-featured.gif", "Singapore", "a slope in Hiroo", "026", "on");
hitotokiData[149] = new featuredEntry("... but anyway please take one of these little cheese cakes ...", "Rick Kennedy", 35.660679, 139.707019, "/classic/tokyo/025", "/classic/images/hitotoki/featured/tokyo-canvases-featured.png", "USA", "a pastry shop in Shibuya", "025", "in");
hitotokiData[52] = new featuredEntry("The inhabitants of the blue, makeshift tents in the bushes.", "Aneta Glinkowska", 35.71711, 139.774203, "/classic/tokyo/024", "/classic/images/hitotoki/featured/hitotoki-te-023-feature.jpg", "Poland", "Ueno Park", "024", "in");

hitotokiData[999999] = new featuredEntry("We're looking for short narratives describing pivotal moments of elation, confusion, absurdity, love or grief or anything in between inseparably tied to a specific place in this sprawling city of Tokyo.", "writer", 22, 22, "/classic/hitotoki_submissions.rtf", "submissionsimg.jpg", "Tokyo", "Submitland", "999999", "in");