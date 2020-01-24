

HI.Controller.Sketching = (function(window){

    function Sketching(){

        var form     = new Sketching.Form(),
            formView = new Sketching.FormView(form);

    }

    //////////////////////////////////////////////////
    ////////////////////////////////////////// FORM //
    //////////////////////////////////////////////////


    Sketching.Form = (function(){
        var geoloc, geo_editor, form, picture, is_submitted,
        submit, extractExifDate;

        function Form(){
            is_submitted = false;

            geoloc = new Sketching.Geoloc();
            geoloc.localizeMe();
        }

        Form.prototype.setView = function(formView){
            this.view = formView;
        }

        Form.prototype.getGeoloc = function(){
            return geoloc;
        }

        Form.prototype.addImage = function(file){
            picture = new Sketching.Pictures(file, this.view.getUploadAction());
            picture.process()
            picture.on("upload_progress", (function(_that){
                return function(progress){
                    if(_that.view && _that.view.setUploadProgress){
                        _that.view.setUploadProgress(progress);
                    }
                }
            })(this) )
            picture.on("exif_done", (function(_that){
                return function(exif){
                    // console.info("event exif", picture.getExif());
                    if(_that.view && _that.view.updateSketchTime){
                        geoloc.localiseEXif( picture.getExif() );
                        _that.view.updateSketchTime( extractExifDate(picture.getExif()).toString() );
                    }
                }
            })(this) )
            picture.on("compress_done", (function(_that){
                return function(dataUrl){
                    if(_that.view && _that.view.updateUploadPreview){
                        _that.view.updateUploadPreview(dataUrl);
                    }
                    if(_that.view && _that.view.setUploadProgress){
                        _that.view.setUploadProgress(100);
                    }
                }
            })(this) )
            picture.on("upload_done", (function(_that){
                return function(){
                    if( is_submitted ){
                        // console.info("auto submit");
                        submit.apply(_that);
                    }
                }
            })(this) )
            picture.on("error", (function(_that){
                return function(message){
                    if(message=="sizes"){
                        alert("Your image should be bigger than 480x480 pixels.")
                    }else{
                        alert("Something went wrong with the picture, please try another one.")        
                    }
                    
                    _that.view.resetUploadPreview()
                    _that.view.unsetSketchingState()
                    picture = null;
                }
            })(this) )
        }

        Form.prototype.submit = function(){
            this.view.setSketchingState()
            if(picture && picture.isBusy()){
                is_submitted = true
                return
            }else{
                submit.apply(this);
            }
        }

        submit = function(){
            if(picture && picture.isBusy()){
                return
            }
            if( !geoloc.getData() ){
                // stop sending
                return alert("We need your location, if it doesn't automatically fill in, please press edit to manually add on the map.");
            }

            var formData = new FormData(), that = this, sharing = {};

            formData.append('sketch_main[text]', this.view.getTextValue());
            if(picture && picture.getImageId()){
                formData.append('sketch_main[image][file]', picture.getImageId());
                formData.append('sketch_main[image][exif]', JSON.stringify( picture.getExif() ) );
                formData.append('sketch_main[exifDate]', extractExifDate(picture.getExif()).originalDateTime );
            }


            formData.append('sketch_main[coordinates][lng]', geoloc.getData().lng);
            formData.append('sketch_main[coordinates][lat]', geoloc.getData().lat);
            formData.append('sketch_main[place][country]', geoloc.getData().place.country);
            formData.append('sketch_main[place][city]', geoloc.getData().place.city);
            formData.append('sketch_main[place][formattedAddress]', geoloc.getData().place.formattedAddress);
            formData.append('sketch_main[place][coordinates]', geoloc.getData().place.coordinates);
            formData.append('sketch_main[place][data]', geoloc.getData().place.data);

            formData.append('sketch_main[_token]', this.view.getSketchToken());

            if(this.view.getFbSharing()){
                sharing.facebook = 1;
                formData.append('fb_sharing', 1);
            }
            if(this.view.getTwSharing()){
                sharing.twitter = 1;
                formData.append('tw_sharing', 1);
            }

            
            $.ajax({
                url: window.urls.sketch_new,
                data: formData,
                processData: false,
                contentType: false,
                type: 'POST',
                dataType: 'json',
                cache: false
            }).always(function(){
                is_submitted = false;
                picture = false;
            }).done(function(data) {
                if (data && data.status && data.status == 'success' && data.redirect_to) {
                    window.Analytics.get().callback( function(){
                        document.location = ''+data.redirect_to;    
                    } ).trackNewSketch( sharing );
                }else{
                    alert("Something went wrong, please try again");
                    that.view.resetUploadPreview()
                    that.view.unsetSketchingState()
                }

            }).fail(function(jqXhr, textStatus, errorThrown){
                alert("Something went wrong, please try again");
                that.view.resetUploadPreview()
                that.view.unsetSketchingState()
            })


        }

        extractExifDate = function(exif){
            if (exif && exif.DateTimeOriginal) {
                // console.info("found!!", exif.DateTimeOriginal)
                return {
                    originalDateTime: exif.DateTimeOriginal,
                    toString: function(){
                        var dateArray, date;

                        dateArray = exif.DateTimeOriginal.split(' ');
                        dateArray[0] = dateArray[0].split(':');
                        dateArray[1] = dateArray[1].split(':');
                        date = new Date(dateArray[0][0], dateArray[0][1]-1, dateArray[0][2], dateArray[1][0], dateArray[1][1], dateArray[1][2]);
                        return date.toDateString();
                    }
                }
            }
            return {
                originalDateTime: "",
                toString: function(){ return ""; }
            }
        }

        return Form;
    })()


    //////////////////////////////////////////////////
    ///////////////////////////////////// FORM VIEW //
    //////////////////////////////////////////////////

    Sketching.FormView = (function(){
        var geo_editor, image_cover_loader,
            sketch_main_text, sketch_main_submit;

        function FormView(form){
            this.form = form;
            this.form.setView(this);

            geo_editor      = new Sketching.GeoEditor($(".sketchLocationEditor"), $(".open_edit_location_link, #geolocation-city-country"), this.form.getGeoloc());
            this.form.getGeoloc().on( Sketching.GeolocEvent.GEOLOC_DONE, _.bind(this.geoUpdated, this) );
            if( this.form.getGeoloc().getData() ){
                this.geoUpdated();
            }
            sketch_main_text = $("#sketch_main_text");
            sketch_main_submit = $('#sketch_main_submit');
            sketch_main_submit

            this.initWordCount();
            this.initImageUploader();

            $('#sketch_main_form').on("submit", _.bind(this.submitForm, this) );

            Sketching.Social.initFacebook( $("#facebook_share_switch"), $("#fbCheckbox") );
            Sketching.Social.initTwitter(  $("#twitter_share_switch"), $("#twCheckbox")  );
        }

        FormView.prototype.setForm = function(form){
            this.form = form;
        }

        FormView.prototype.submitForm = function(e){
            if(e&&e.preventDefault){ e.preventDefault() }
            // console.info("submitted", e);
            this.form.submit();
        }

        FormView.prototype.geoUpdated = function(){
            var geoloc = this.form.getGeoloc();
            var cityCountry = geoloc.getData().place.city + ', <em>'+geoloc.getData().place.country+'</em>';
            $('#geolocation-city-country').innerload("kill").html(cityCountry);

            $('#geolocation-trigger').removeClass('geolocation-inactive');
            $('#geolocation-trigger').addClass('geolocation-active');
        }

        FormView.prototype.initImageUploader = function(){
            var form = this.form;
            document.getElementById('sketch_main_image_file').addEventListener('change', function(e){
                form.addImage(e.target.files[0])
            });
            $('#image-upload-trigger').on('click',function() {
                $('#sketch_main_image_file').trigger('click');
            });
        }


        FormView.prototype.getUploadAction = function(){
            return $("#sketch_main_form").data('uploadaction')
        }
        FormView.prototype.getTextValue = function(){
            return sketch_main_text.val()
        }
        FormView.prototype.getSketchToken = function(){
            return $("#sketch_main__token").val()
        }
        FormView.prototype.getFbSharing = function(){
            return !!$("#fbCheckbox").prop("checked")
        }
        FormView.prototype.getTwSharing = function(){
            return !!$("#twCheckbox").prop("checked")
        }


        FormView.prototype.updateUploadPreview = function(dataURL)
        {
            $('#image-upload-trigger').css({'background-image': 'url('+dataURL+')', 'background-size': 'cover', 'background-position': 'center center'});
            $('#image-upload-trigger').addClass("fullBleed");
            $('#image-upload-trigger').html('');
            $('#image-upload-wrap').addClass("fullBleed");

            image_cover_loader = $("<div></div>").css({
                "float":           "right",
                "height":          "100%",
                "width":           "100%",
                "backgroundColor": "rgba(255,255,255,0.498039)"
            }).addClass("loadbar").attr("id", "image_cover_loadbar");
            $('#image-upload-trigger').append(image_cover_loader)
        }
        FormView.prototype.resetUploadPreview = function()
        {
            $("#image_cover_loadbar").remove();
            $('#sketch_main_image_file').val('');
            $('#image-upload-trigger').css({'background-image': 'none'});
            $('#image-upload-trigger').removeClass("fullBleed");
            $('#image-upload-trigger').html('Upload a photo');
            $('#image-upload-wrap').removeClass("fullBleed");
            $('#sketch-date').html("");
        }
        FormView.prototype.setUploadProgress = function(progress)
        {
            if( image_cover_loader ){
                image_cover_loader.transition({
                    "width": (100-progress)+"%"
                }, 100);
            }
        }

        FormView.prototype.updateSketchTime = function(time){
            $('#sketch-date').html(time);
        }

        FormView.prototype.setSketchingState = function() {
            sketch_main_submit.attr('disabled', 'disabled').html('Sketching').innerload();
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
                $('body').append('<div class="centered-overlay" id="overlay-message"><div class="text">Sketching <div id="circleG"><div id="circleG_1" class="circleG"></div><div id="circleG_2" class="circleG"></div><div id="circleG_3" class="circleG"></div></div> </div><div>').show('tiny');
                $('#overlay-message').addClass("black-bg")
            }
        }
        FormView.prototype.unsetSketchingState = function(){
            sketch_main_submit.removeAttr('disabled').html('Sketch');
            $('.centered-overlay').remove();
        }

        FormView.prototype.enableSubmit = function(bool){
            sketch_main_submit.prop("disabled", !bool );
            if(!sketch_main_submit.prop("disabled")){
                sketch_main_submit.html('Sketch');
            }
        }

        FormView.prototype.initWordCount = function(){

            sketch_main_text.on('focus', function() {
                $(this).attr('placeholder', 'Start typing');
            }).autosize();

            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
                sketch_main_text.on('blur', function() {
                    sketch_main_text.attr('placeholder', 'Tap to start');
                });
            } else {
                sketch_main_text.show().focus();
            }
            // Word count
            var that = this;
            sketch_main_text.on("keyup focus",
                function(e) {
                    var message = '0/20 words',
                        nonLatinExtended = /[^\u0000-\u02af]/,
                        suffix = '/20 words',
                        message,

                        facebook_switch         = $('#facebook_share_switch'),
                        facebook_switch_input   = $('#facebook_share_switch input[type=checkbox]'),
                        twitter_switch          = $('#twitter_share_switch'),
                        twitter_switch_input    = $('#twitter_share_switch input[type=checkbox]');

                    var text = sketch_main_text.val();
                    if (text.length) {
                      var text = text.replace(/(\(|\)|\*|\||\+|\”|\’|_|;|:|,|\.|\?)/ig," ").trim();
                      // var text = text.replace(/\s+/ig," ");
                      var count = text.split(/\s+/g).length;
                    } else {
                      count = 0;
                    }



                    message = count + suffix;
                    if (count > 30) {

                        that.enableSubmit(false)

                        //$('#facebook_share_switch').addClass("disabled");
                        facebook_switch_input.prop("disabled", true);
                        twitter_switch_input.prop("disabled", true);
                        sketch_main_submit.html('Shave off a few');

                        message = '<font color="red">' + "More to say? Once you've posted your sketch, you can extend it." + '</font>';
                    } else if (count > 20) {
                        that.enableSubmit(true)

                        facebook_switch.removeAttr('style')
                        twitter_switch.removeAttr('style')
                        message = '<font color="red">' + message + '</font>';
                    } else if (count > 10) {
                        that.enableSubmit(true)

                        facebook_switch.removeAttr('style', 'display:none;')
                        twitter_switch.removeAttr('style', 'display:none;')
                        message = '<font color="orange">' + message + '</font>';
                    } else if (count > 0) {
                        that.enableSubmit(true)
                        //$('#facebook_share_switch').removeClass("disabled");
                        facebook_switch_input.prop("disabled", false);
                        twitter_switch_input.prop("disabled", false);
                        message = '<font color="#ccc">' + message + '</font>';
                    } else {
                        that.enableSubmit(false)
                        //$('#facebook_share_switch').addClass("disabled");
                        facebook_switch_input.prop("disabled", true);
                        twitter_switch_input.prop("disabled", true);
                    }

                    if (nonLatinExtended.test(text)) {
                      sketch_main_text.addClass('non_latin_text');
                    } else {
                      sketch_main_text.removeClass('non_latin_text');
                    }
                    $('#editor_word_count').html(message);
                }
            ).keyup();
        }

        return FormView;
    })()


    //////////////////////////////////////////////////
    //////////////////////////////////////// GEOLOC //
    //////////////////////////////////////////////////
    Sketching.GeolocEvent = (function(){
        function GeolocEvent(type, geoloc){
            this.type   = type;
            this.geoloc = geoloc;
        }
        GeolocEvent.GEOLOC_DONE = "Sketching.GeolocEvent.GEOLOC_DONE"

        return GeolocEvent
    })();

    //////////////////////////////////////////////////

    Sketching.Geoloc = (function(){
        var recordGeoloc, geodata;

        function Geoloc(){
            _.extend(this, EventsDispatcher);
        }

        Geoloc.prototype.init = function(){}

        Geoloc.prototype.getData = function(){
            return geodata;
        };

        Geoloc.prototype.localizeMe = function(){
            HI.Controller.Geolocation.initGeolocation( _.bind(recordGeoloc, this) );
        }
        Geoloc.prototype.localiseEXif = function(exif){
            if(exif && exif.GPSLongitude && exif.GPSLatitude){
                var aLong = exif.GPSLongitude,
                    aLat = exif.GPSLatitude,

                // convert from deg/min/sec to decimal for Google
                    strLongRef = exif.GPSLongitudeRef || "W",
                    strLatRef = exif.GPSLatitudeRef || "N",
                    fLong = (aLong[0] + aLong[1]/60 + aLong[2]/3600) * (strLongRef == "W" ? -1 : 1),
                    fLat = (aLat[0] + aLat[1]/60 + aLat[2]/3600) * (strLatRef == "N" ? 1 : -1);

                HI.Controller.Geolocation.reverseGeocode(fLong, fLat, _.bind(recordGeoloc, this));
            }

        };
        Geoloc.prototype.reverseGeocode = function(fLong, fLat){
            HI.Controller.Geolocation.reverseGeocode(fLong, fLat, _.bind(recordGeoloc, this));
        }

        recordGeoloc = function(geocodedLocation) {
            var t;

            geodata = {}
            geodata.lng = geocodedLocation.original_longitude
            geodata.lat = geocodedLocation.original_latitude
            geodata.place = {
                data:               JSON.stringify(geocodedLocation),
                city:               geocodedLocation.city,
                alias:              geocodedLocation.alias,
                country:            geocodedLocation.country,
                coordinates:        geocodedLocation.geometry.location.lng() + ',' + geocodedLocation.geometry.location.lat(),
                formattedAddress:   geocodedLocation.formatted_address
            }

            t = Sketching.GeolocEvent.GEOLOC_DONE;
            this.trigger(t, new Sketching.GeolocEvent(t, this));
        }

        return Geoloc;
    })()

    //////////////////////////////////////////////////

    Sketching.GeoEditor = (function(){
        var search;

        function GeoEditor(base_element, open_link, geoloc){
            this.geoloc       = geoloc;
            this.base_element = base_element;
            this.open_link    = open_link;
            this.map_element  = base_element.find(".edit-map");
            this.search_form  = base_element.find("form");
            this.search_field = base_element.find(".searchfield");
            this.search_btn   = base_element.find("button.search");
            this.cancel       = base_element.find(".cancel");
            this.done         = base_element.find(".done");
            this.geocoder     = new google.maps.Geocoder(),


            this.buildMap();
            this.buildMarker();
            this.initEvents();

            this.geoloc.on( Sketching.GeolocEvent.GEOLOC_DONE, _.bind(this.centerTo, this) );
        }
        GeoEditor.DEFAULT_LAT = "35.6611878";
        GeoEditor.DEFAULT_LNG = "139.7194706";

        GeoEditor.prototype.buildMap = function(){
            var map_options, map;
            map_options = {
              center: new google.maps.LatLng( GeoEditor.DEFAULT_LAT, GeoEditor.DEFAULT_LNG ),
              zoom: 12,
              scrollwheel: false,
              zoomControl: true,
              panControl: false,
              zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.TOP_LEFT
              },
              mapTypeControl: false,
            }
            map = this.map = this.map_element.hitomap( map_options );
        }
        GeoEditor.prototype.buildMarker = function(){
            var map, marker;
            map = this.map;
            marker = this.marker = $().hitomap("addMarker", map, {
              lat: GeoEditor.DEFAULT_LAT,
              lng: GeoEditor.DEFAULT_LNG
            });
            this.marker.setDraggable(true);
        }
        GeoEditor.prototype.initEvents = function(){
            var map, marker, base_element, geoloc, idl, that;

            map = this.map;
            marker = this.marker;
            base_element = this.base_element
            geoloc = this.geoloc;
            that = this;

            $(window).resize(function(){
                google.maps.event.trigger(map, 'resize');
            })

            google.maps.event.addListener(map, 'click', function(e){
              marker.setPosition(e.latLng)
            })
            idl = google.maps.event.addListener(map, 'idle', idl = function(e){
                base_element.css({
                    right: "0px",
                    display: "none"
                });
                google.maps.event.removeListener(idl);
            })

            this.open_link.click(function(e){
              if(e&&e.preventDefault){e.preventDefault();}
              base_element.slideDown({
                complete: function(){
                    google.maps.event.trigger(map, 'resize');
                    setTimeout(function(){ map.setCenter(marker.getPosition()); },0)
                }
              });
            });

            this.cancel.click(function(e){
              if(e&&e.preventDefault){e.preventDefault();}
              // put the pin back to where it belongs
              marker.setPosition(new google.maps.LatLng(geoloc.getData().lat, geoloc.getData().lng));
              base_element.slideUp();
            });

            this.done.click(function(e){
                if(e&&e.preventDefault){e.preventDefault();}
                geoloc.reverseGeocode( marker.getPosition().lng(), marker.getPosition().lat() );
            })
            this.search_field.keypress(function(e) {
                if(e&&e.keyCode){
                    if (e.keyCode == '13') {
                        e.preventDefault();
                        search.apply(that)
                    }
                }
            });
            this.search_btn.click(function(e){
                if(e&&e.preventDefault){e.preventDefault();}
                search.apply(that)
            })
        }

        search = function(){

            var that = this;
            this.geocoder.geocode({'address': this.search_field.val()}, function(results, status){
                if(status == google.maps.GeocoderStatus.OK){
                  that.map.setCenter(results[0].geometry.location)
                  that.marker.setPosition(results[0].geometry.location)
                }else{
                  Alert("No results for " + that.search_field.val());
                }
              })
        }

        GeoEditor.prototype.centerTo = function(e){
            this.map.setCenter(new google.maps.LatLng(e.geoloc.getData().lat, e.geoloc.getData().lng));
            this.marker.setPosition(new google.maps.LatLng(e.geoloc.getData().lat, e.geoloc.getData().lng));
            this.cancel.click();
            this.open_link.show();
        }

        return GeoEditor;
    })()


    //////////////////////////////////////////////////
    /////////////////////////////////////// PICTURE //
    //////////////////////////////////////////////////

    Sketching.Pictures = (function(){
        var ExifReader, Compressor, Uploader;

        ExifReader = (function(){
            var binaryReader, exif, start, abort, error, read;
            function ExifReader(){
                _.extend(this, EventsDispatcher);

                binaryReader = new FileReader();
                binaryReader.onloadstart    = _.bind(start, this);
                binaryReader.onerror        = _.bind(error, this);
                binaryReader.onabort        = _.bind(abort, this);
                binaryReader.onload         = _.bind(read, this);
            }

            ExifReader.prototype.process = function(file){
                if(binaryReader.readAsBinaryString){
                    binaryReader.readAsBinaryString(file);
                }else if( binaryReader.readAsArrayBuffer ){
                    binaryReader.readAsArrayBuffer(file);
                }else{
                    binaryReader.onerror();
                }
            }

            ExifReader.prototype.getExif = function(){
                return exif;
            }

            start = function(){ this.trigger("start") }
            error = function(){ this.trigger("error") }
            abort = function(){ this.trigger("error") }
            read  = function(event){
                var f = new BinaryFile(event.target.result);
                exif = EXIF.readFromBinaryFile(f);
                this.trigger("done", exif);
            }

            return ExifReader;
        })()

        Compressor = (function(){
            var canvas, mpImg, dataUrl, _timeout;

            function Compressor(){
                _.extend(this, EventsDispatcher);

                canvas = document.createElement("canvas");
            }

            Compressor.prototype.compress = function(file, orientation){
                mpImg = new MegaPixImage(file);
                mpImg.onrender = _.bind(this.imageRendered, this);

                mpImg.render(canvas, { maxWidth: 1920, maxHeight: 1280, orientation: orientation });
                this.trigger("start");
            }

            Compressor.prototype.imageRendered = function(){

                if(mpImg.srcImage.naturalWidth < 480 || mpImg.srcImage.naturalHeight < 480){
                    this.trigger("error", "sizes");
                }else{
                    dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    if (dataUrl != 'data:,') {
                        this.trigger("done", dataUrl);
                    } else {
                        this.trigger("error");
                    }
                }
            }

            Compressor.prototype.getDataData = function(){
                return dataUrl;
            }
            Compressor.prototype.getMpImg = function(){
                return mpImg;
            }

            return Compressor;
        })()

        Uploader = (function(){
            var xhr, onreadystatechange, imageId, progress, upload_action;
            function Uploader( action ){
                _.extend(this, EventsDispatcher);

                upload_action = action;
                xhr = new XMLHttpRequest();
                xhr.upload.onprogress  = _.bind(onprogress, this);
                xhr.onreadystatechange = _.bind(onreadystatechange, this);
            }

            Uploader.prototype.getProgress = function(){
                return progress;
            }
            Uploader.prototype.getImageId = function(){
                return imageId;
            }

            Uploader.prototype.upload = function(imageData){
                this.progress = 0;

                var fd = new FormData();
                fd.append('image', imageData);

                xhr.open('POST', upload_action, true);
                xhr.send(fd);

                this.trigger("start");
            }
            onprogress = function(e){
                if (e.lengthComputable) {
                    progress = Math.ceil((e.loaded / e.total) * 100);
                    this.trigger("progress", progress)
                }
            }
            onreadystatechange = function(e){
                var resp;
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        try{
                            resp = JSON.parse(xhr.responseText);
                            if( resp.file ){
                                imageId = resp.file;
                                // lets delay the trigger for debug reasons
                                var that = this;
                                setTimeout(function(){
                                    that.trigger("done", imageId);
                                },0)

                            }else{
                                console.log("Failed uploading (no file)");
                                this.trigger("error");
                            }
                        }catch(err){
                            console.log("Failed uploading (no json)");
                            this.trigger("error");
                        }

                    } else {
                        console.log("Failed uploading (not 200)");
                        this.trigger("error");
                    }
                }
            }

            return Uploader;
        })()

        return (function(){
            var exifReader, compressor, uploader, isBusy, hasImage,
                exifStart, exifDone, exifError,
                compressStart, compressDone, compressError,
                uploadStart, uploadProgress, uploadDone, uploadError;

            function Pictures(file, upload_action){
                _.extend(this, EventsDispatcher);

                this.file  = file;

                isBusy     = false;
                hasImage   = false;

                exifReader = new ExifReader();
                exifReader.on("start", _.bind(exifStart, this));
                exifReader.on("done",  _.bind(exifDone, this));
                exifReader.on("error", _.bind(exifError, this));

                compressor = new Compressor();
                compressor.on("start", _.bind(compressStart, this));
                compressor.on("done",  _.bind(compressDone, this));
                compressor.on("error", _.bind(compressError, this));

                uploader   = new Uploader(upload_action);
                uploader.on("start", _.bind(uploadStart, this));
                uploader.on("progress",  _.bind(uploadProgress, this));
                uploader.on("done",  _.bind(uploadDone, this));
                uploader.on("error", _.bind(uploadError, this));
            }

            Pictures.prototype.isBusy = function(){
                return isBusy;
            }
            Pictures.prototype.hasImage = function(){
                return hasImage;
            }
            Pictures.prototype.getExif = function(){
                return exifReader.getExif();
            }
            Pictures.prototype.getImageData = function(){
                return compressor.getDataData();
            }
            Pictures.prototype.getMpImg = function(){
                return compressor.getMpImg();
            }
            Pictures.prototype.getImageId = function(){
                return uploader.getImageId();
            }

            Pictures.prototype.process = function() {
                isBusy = true;
                hasImage = false;
                // console.info("handleFile", this.file);

                exifReader.process(this.file);
            }

            exifStart = function(){
                // console.info("start exif");
                this.trigger("exif_start");
            };
            exifDone  = function(exif){
                // console.info("Exif loaded", exif);
                this.trigger("exif_done");
                compressor.compress(this.file, exif?exif.Orientation:null)
            };
            exifError = function(){
                isBusy = false;
                // console.info("exif error... abort");
                this.trigger("exif_error");
                this.trigger("error");
            };

            compressStart = function(){
                // console.info("start compressor");
                this.trigger("compress_start");
            };
            compressDone  = function(data){
                // console.info("compressed!");
                this.trigger("compress_done", data);
                uploader.upload(data);
            };
            compressError = function(message){
                isBusy = false;
                // console.info("compressor error... abort");
                this.trigger("compress_error");
                this.trigger("error", message);
            };

            uploadStart = function(){
                // console.info("start upload");
                this.trigger("upload_start");
            };
            uploadProgress = function(progress){
                // console.info("upload @ ", progress, "%");
                this.trigger("upload_progress", progress);
            };
            uploadDone = function(){
                isBusy     = false;
                hasImage   = true;
                // console.info("upload done! got image #", this.getImageId() );
                this.trigger("upload_done", this.getImageId());
            };
            uploadError = function(){
                // console.info("upload error...");
                isBusy     = false;
                this.trigger("upload_error");
                this.trigger("error");
            };


            return Pictures;
        })()

    })()




    //////////////////////////////////////////////////
    //////////////////////////////////////// SOCIAL //
    //////////////////////////////////////////////////

    Sketching.Social = function(){

    }

    Sketching.Social.getFacebookShare = function(){
        if( Sketching.Social.facebook_input ){
            return Sketching.Social.facebook_input.prop("checked");
        }
        return false;
    }
    Sketching.Social.initFacebook = function( switch_element, input ){
        Sketching.Social.facebook_input = input;

        var label     = switch_element.find("label"),
            input     = switch_element.find("input"),
            cookie    = 'auto_fb_active',
            setcookie = function(){
                setTimeout(function(){
                    $.cookie(cookie, (input.prop("checked")?1:0));
                }, 100);
            };

        if( switch_element.data("action") ){
            label.click(function(e){
                if(e&&e.preventDefault){e.preventDefault();};

                var action = switch_element.data("action"),
                    scopes = switch_element.data("scope");

                FB.login(function(response){
                    if(!response.authResponse){
                      return;
                    }
                    $.ajax({
                        url: action,
                        method: "post",
                        data: response.authResponse
                    }).done(function(data){
                        if(data.error){
                          alert(data.error);
                        }else{
                          label.off()
                          input.prop("checked", true);
                          $.cookie(cookie, 1);
                          label.click(setcookie)
                        }

                    })
                }, {scope: scopes})
            })
        }else{
            input.prop("checked", !!Number($.cookie(cookie)));
            label.click(setcookie);
        }
    }


    Sketching.Social.getTwitterShare = function(){
        if( Sketching.Social.twitter_input ){
            return Sketching.Social.twitter_input.prop("checked");
        }
        return false;
    }
    Sketching.Social.initTwitter = function( switch_element, input ){
        Sketching.Social.twitter_input = input;

        var label     = switch_element.find("label"),
            input     = switch_element.find("input"),
            cookie    = 'auto_tw_active',
            setcookie = function(){
                setTimeout(function(){
                    $.cookie(cookie, (input.prop("checked")?1:0));
                }, 100);
            };

        if( switch_element.data("login") ){
            input.prop("checked", false)
            label.click(function(e){
                if(e&&e.preventDefault){e.preventDefault();};

                $.oauthpopup({
                    path: switch_element.data("login"),
                    callback: function(){
                        $.ajax({
                            url: switch_element.data("check"),
                            type: "json",
                            method: "get"
                        }).done(function(d){

                            if(d.twitter_token){
                                // ok
                                input.prop("checked", true);
                                label.off();
                                $.cookie(cookie, 1);
                                label.click(setcookie);
                            }else{
                              alert("This twitter user is already linked to another Hi account.")
                              input.prop("checked", false);
                            }
                        })
                    }
                });
            });
        }else{
            input.prop("checked", !!Number($.cookie(cookie)));
            label.click(setcookie);
        }
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////

    return Sketching;

})(this)