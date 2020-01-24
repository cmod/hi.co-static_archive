$(function(){
    var upload_image;

    upload_image = function(e){
        if(e&&e.preventDefault){e.preventDefault()}
        var btn = $(this),
            new_image_data;

        old_image = $("div.desktop_image").css("background-image");

        $('<input type="file" />').on("change", function(e){
            var file = e.target.files[0];

            btn.prop("disabled", true).text("processing: initialize");

            picture = new HI.Controller.Sketching.Pictures(file, Routing.generate("sketch_new_upload_image") );
            picture.process()
            picture.on("upload_progress", function(progress){
                btn.text("processing: " + progress+"%")
            })

            picture.on("compress_done", function(dataUrl){
                new_image_data = dataUrl
            })

            picture.on("upload_done", function(e){
                console.info("yay?", e)
                new_image_id = e;

                $(".open_edit_picture_link").text("Processing: finalizing");

                $.ajax({
                    method: "post",
                    url: Routing.generate("sketch_new_edit_piture"),
                    data: {
                        sketch_id: window.current_sketch.id,
                        image_id: e
                    }
                }).fail(function(){
                    alert("Something went wrong with the picture, please try another one.")
                }).done(function(){
                    if( $(".photo_moment")[0] ){
                        $("a.fancybox")
                            .attr("data-iwidth",  picture.getMpImg().srcImage.naturalWidth)
                            .attr("data-iheight", picture.getMpImg().srcImage.naturalHeight)
                            .attr("data-href", new_image_data)
                            .data("iwidth",  picture.getMpImg().srcImage.naturalWidth)
                            .data("iheight", picture.getMpImg().srcImage.naturalHeight)
                            .data("href", new_image_data);
                            

                    
                        $("div.desktop_image").css("background-image", 'url('+new_image_data+')');
                    }else{
                        window.location.reload()
                    }
                }).always(function(){
                    btn.prop("disabled", false).text("Edit Picture");
                })
            })

            picture.on("error", function(){
                alert("Something went wrong with the picture, please try another one.")
                btn.text("Edit Picture");
            })


        }).click()
    }

    $(".open_edit_picture_link").on("click", upload_image);

})