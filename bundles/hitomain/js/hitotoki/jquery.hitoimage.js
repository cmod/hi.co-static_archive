(function ($) {
    var methods = {
        makeDraggable: function (callback) {
            var parentLeft = $(this).parent().offset().left;
            var parentTop = $(this).parent().offset().top;
            var parentWidth = $(this).parent().width();
            var parentHeight = $(this).parent().height();
            var imageWidth = $(this).width();
            var imageHeight = $(this).height();
            if (imageWidth > parentWidth || imageHeight > parentHeight ) {
                $(this).css('cursor','move');
                $(this).draggable({
                    scroll: false,
                    containment: [ parentWidth-imageWidth+parentLeft, parentHeight-imageHeight+parentTop, parentLeft, parentTop ],
                    stop: function(event, ui) {
                        callback.call(this, ui.position.top, ui.position.left);
                    }
                });
            }
        },

        position: function (top, left) {
            $(this).css('top', top+'px');
            $(this).css('left', left+'px');
        }
    };

    $.fn.hitoimage = function (method) {
        // Method calling logic
        if (methods[method]) {
          return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
          return methods.renderMap.apply(this, arguments);
        } else {
          $.error('Method ' +  method + ' does not exist on jQuery.hitoimage' );
        }
    }
})(window.jQuery);