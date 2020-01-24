$(function(){

    var map_icon = $(".map_icon"),
        map_icon_close = $(".map_icon_close"),
        map,
        map_container;

    map_icon.css({
        background: "url(/bundles/hitomain/images/hitopin_retina2_hover.png) 50% 50% no-repeat, url("+map_icon.data("map")+") 50% 50% no-repeat",
        backgroundSize: "19px 24px, 150px 150px"
    })

    function open(){
        map_icon.addClass("opened");
        map_icon.off("click", open);

        map_icon_close.fadeIn("fast").on("click", close);
        map_icon.css({
            background: "#fff url(/bundles/hitomain/images/hitopin_retina2_hover.png) 50% 50% no-repeat",
            backgroundSize: "19px 24px"
        })

        map_icon.on("transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd", on_open);
        map_icon.off("transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd", on_close);
    }
    function on_open(e){
        if(e.originalEvent&&e.originalEvent.propertyName=="height"){
            // we opened it
            // add a map container
            map_container = $("<div></div>").css("height", "100%")
            map_icon.append(map_container);
            map = map_container.hitomap();
            map.setZoom(14);
            $().hitomap("addMarkerWithInfobox", map, window.current_sketch, true, function(marker, infobox){
                $().hitomap('showInfoBox', infobox, marker, map);
            });
        }
    }

    function close(){
        map_icon.removeClass("opened");
        if(map_container&&map_container.remove){
            map_container.remove();
        }
        map = null;

        map_icon_close.fadeOut("fast").off("click", close);

        map_icon.off("transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd", on_open);
        map_icon.on("transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd", on_close);
    }
    function on_close(e){
        if(e.originalEvent&&e.originalEvent.propertyName=="height"){
            map_icon.on("click", open);

            map_icon.css({
                background: "url(/bundles/hitomain/images/hitopin_retina2_hover.png) 50% 50% no-repeat, url("+map_icon.data("map")+") 50% 50% no-repeat",
                backgroundSize: "19px 24px, 150px 150px"
            })
        }
    }


    map_icon.on("click", open);

    // map_icon.click(function(e){
    //     if(e&&e.preventDefault){e.preventDefault();}
    //     if(map_container&&map_container.remove){
    //         map_container.remove();
    //     }
    //     map = null;
    //     map_icon.toggleClass("opened");
    //     return false;
    // }).on("transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd", function(e){
    //     if(e.originalEvent&&e.originalEvent.propertyName=="height"){
    //         if(map_icon.height() > 50){


    //         }else{
    //             // we closed it
    //             map_container.remove();
    //             map = null;
    //         }


    //     }
    // });

})