var MOBILE_MAX_WIDTH = 768;
var positionImage = function() {
  console.log("Positioning the image");
  var isLandscape = $('#moment_image').hasClass('landscape');
  var cssSide = isLandscape ? 'top' : 'left';

  var offset = $('#moment_image').data('offset');
  var currentImageSize = isLandscape ? $('#moment_image').height() : $('#moment_image').width();
  var wrapSize = isLandscape ? $('.head_wrap').height() : $('.head_wrap').width();
  var position = (currentImageSize - wrapSize)/2 - offset;

  if ((currentImageSize - position) < wrapSize) {
    position = currentImageSize - wrapSize;
  }
  $('#moment_image').css(cssSide, '-' + position + 'px');
};