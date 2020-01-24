// create element fixed position
// translate it to scroll pos
// animate it to center


$(function(){
    var headimage = $(".fancybox"),
        width     = Number(headimage.data("iwidth")),
        height    = Number(headimage.data("iheight")),
        cover_elem = $(".head_wrap"),
        desktop_img = $(".desktop_image"),
        cover     = $(".desktop_image").css("background-image"),
        win       = $(window),
        doc       = $(document),
        lightbox,
        fog,
        init_scroll_y;


    function openable(e){
        if(e&&e.preventDefault){ e.preventDefault(); }

        var nwidth, nheight, posx, posy, ratio, ref=$(e.currentTarget);

        width     = ref.data("iwidth");
        height    = ref.data("iheight");

        ratio = (win.height()-40) / height;
        nheight = (win.height()-40);
        nwidth = width*ratio;

        if(nwidth>win.width()){
            ratio   = (win.width()-40) / width;
            nheight = height*ratio;
            nwidth  = (win.width()-40);            
        }
        

        posy = $(document).scrollTop() + ( (win.height()-nheight) /2);
        posx = (win.width() - nwidth)/2;

        init_scroll_y = $(document).scrollTop();

        lightbox  = $("<div></div>");
        fog       = $(".off-canvas-wrap");


        lightbox.css({
            "perspective": "0",
            "position": "fixed",
            "top":      "-"+init_scroll_y+"px",
            "zIndex":   "9999999",
            "opacity":   "1",
            "width":  "100%",
            "height": desktop_img.height(),
            "background-image": "url("+headimage.data("href")+")",
            "background-size": "cover",
            "background-position": "center center"
        })

        $("body").append(lightbox);

        setTimeout(function(){
            fog.transition({"opacity": "0"}, 200, "in")

            lightbox.transition({
                y: posy+"px",
                x: posx+"px",
                height: nheight+"px",
                width: nwidth+"px"
            }, 200, "ease"); // "cubic-bezier(0.550, 0.490, 0.010, 1.220)"
            win.on("click touchstart", closeable);
        }, 10)


        

        headimage.off("click", openable);
        headimage.on("click", cleaned);

        win.on("mousewheel DOMMouseScroll", cleaned);
        doc.on("keyup", lookForEscape);
    }
    // easing: http://matthewlein.com/ceaser/
    function closeable(e){
        if(e&&e.preventDefault){ e.preventDefault(); }
        //var lightbox = $(this);

        setTimeout(function(){
            lightbox.transition({
                y: (init_scroll_y - $(document).scrollTop()) + "px",
                x: "0px",
                width:  win.width(),
                height: desktop_img.height()
            }, 200, "ease", function(){ // "cubic-bezier(0.550, 0.490, 0.010, 1.220)"
                fog.transition({"opacity": "1"}, 100, "in", function(){

                    lightbox.transition({
                        opacity: "0"
                    }, 200, "out", function(){
                        lightbox.css({opacity:   "0"});
                        lightbox.remove();

                        
                        
                        headimage.off("click", cleaned);
                        headimage.on("click", openable);
                        win.off("mousewheel DOMMouseScroll", cleaned);
                    });

                })
                
            });
        }, 100)

        win.off("click touchstart", closeable);
        doc.off("keyup", lookForEscape);
    }
    function cleaned(e){
        if(e&&e.preventDefault){ e.preventDefault(); }
    }
    function lookForEscape(e){
        if (e.keyCode == 27) {
            closeable();
        }
    }

    headimage.on("click", openable);

})