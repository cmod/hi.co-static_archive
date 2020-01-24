function createRequestObject() {
    var ro;
    var browser = navigator.appName;
    if(browser == "Microsoft Internet Explorer"){
        ro = new ActiveXObject("Microsoft.XMLHTTP");
    }else{
        ro = new XMLHttpRequest();
    }
    return ro;
}

var http = createRequestObject();

function sndReq(message) {
    var response_text = document.getElementById('feedback').value;
	var initial_string = document.getElementById('initial_string').value;
	
    http.open('get', '/js/mail_me.php?action='+message+'&text='+response_text+'&initial_string='+initial_string);

    http.onreadystatechange = handleResponse;
    http.send(null);
}

function handleResponse() {
    if(http.readyState == 4){
        var response = http.responseText;
        var update = new Array();

        // For Debugging
		// document.getElementById('response').innerHTML += response;
		
        if(response.indexOf('|' != -1)) {
            update = response.split('|');
            document.getElementById(update[0]).innerHTML = update[1];
        }
    }
}