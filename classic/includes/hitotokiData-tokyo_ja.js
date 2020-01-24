


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
indexLookUp.push("171");
indexLookUp.push("124");
indexLookUp.push("121");
indexLookUp.push("115");
indexLookUp.push("90");
indexLookUp.push("81");
indexLookUp.push("80");
indexLookUp.push("78");
indexLookUp.push("76");
indexLookUp.push("74");


// Our hitotoki data for the featured section
var hitotokiData = new Array();
hitotokiData[171] = new featuredEntry("ポツンと東京を見下ろすその姿は気高く、とても真摯だ。", "mugi", 35.672916, 139.752617, "/classic/tokyo/jp/016", "/classic/images/hitotoki/featured/tokyo_ja/hitotoki_j_16_home.jpg", "東京", "港区神谷町駅から、愛宕神社までの道すがら", "016", "{in_at_on-tokyo_ja}");
hitotokiData[124] = new featuredEntry("光に彩られて先輩の横顔が、綺麗に染まる.。", "UP2U", 35.799472, 139.663031, "/classic/tokyo/jp/015", "/classic/images/hitotoki/featured/tokyo_ja/hitotoki-j-015-feature.jpg", "東京", "荒川戸田橋緑地", "015", "{in_at_on-tokyo_ja}");
hitotokiData[121] = new featuredEntry("悲しくて歩けないという気持ちを初めて知った夜", "健司", 35.697595, 139.73897, "/classic/tokyo/jp/014", "/classic/images/hitotoki/featured/tokyo_ja/tokyojp-14-portrait.jpg", "奈良県", "千代田区五番町ソニー・ミュージックの前", "014", "{in_at_on-tokyo_ja}");
hitotokiData[115] = new featuredEntry("私たちの声だけが静かに揺れた", "tsuruyou", 35.653112, 139.66713, "/classic/tokyo/jp/013", "/classic/images/hitotoki/featured/tokyo_ja/tokyo-j-13-featured.jpg", "石川県", "世田谷区若林の住宅街", "013", "{in_at_on-tokyo_ja}");
hitotokiData[90] = new featuredEntry("細くぐるりと指を囲む、日焼けをしていない左手の薬指の根元", "nog", 35.723643, 139.693201, "/classic/tokyo/jp/012", "/classic/images/hitotoki/featured/tokyo_ja/nog_portrait-2.jpg", "青森", "豊島区目白南長崎1丁目交差点", "012", "{in_at_on-tokyo_ja}");
hitotokiData[81] = new featuredEntry("涙を流しながら煙を吐く彼の隣", "新城", 35.6923, 139.743749, "/classic/tokyo/jp/011", "/classic/images/hitotoki/featured/tokyo_ja/shinjo2_portrait.jpg", "東京", "千代田区三番町御鹿谷坂下交差点", "011", "{in_at_on-tokyo_ja}");
hitotokiData[80] = new featuredEntry("幼い耳には雑音にしか聴こえない音楽に興味が湧いた", "Aki", 35.709664, 139.774466, "/classic/tokyo/jp/010", "/classic/images/hitotoki/featured/tokyo_ja/akimaru_portrait.jpg", "東京", "台東区の上野アメ横センタービル", "010", "{in_at_on-tokyo_ja}");
hitotokiData[78] = new featuredEntry("今年も蕎麦が食べられるなぁ", "UP2U", 35.676437, 139.787292, "/classic/tokyo/jp/009", "/classic/images/hitotoki/featured/tokyo_ja/eitai_portrait.jpg", "東京", "中央区新川一丁目の永代橋の上", "009", "{in_at_on-tokyo_ja}");
hitotokiData[76] = new featuredEntry("お堀に映った月をみんなで見てる", "93", 35.679296, 139.762316, "/classic/tokyo/jp/008", "/classic/images/hitotoki/featured/tokyo_ja/moon_portrait.jpg", "福岡", "千代田区丸の内の明治生命館の前", "008", "{in_at_on-tokyo_ja}");
hitotokiData[74] = new featuredEntry("バッグの中だけがつめたいまま", "mihoko", 35.669012, 139.761822, "/classic/tokyo/jp/007", "/classic/images/hitotoki/featured/tokyo_ja/007_163.jpg", "東京", "中央区銀座花椿通りの端", "007", "{in_at_on-tokyo_ja}");

hitotokiData[999999] = new featuredEntry("We're looking for short narratives describing pivotal moments of elation, confusion, absurdity, love or grief or anything in between inseparably tied to a specific place in this sprawling city of Tokyo.", "writer", 22, 22, "/classic/hitotoki_submissions.rtf", "submissionsimg.jpg", "Tokyo", "Submitland", "999999", "in");