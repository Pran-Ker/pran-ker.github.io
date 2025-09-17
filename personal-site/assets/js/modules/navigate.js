function ready() {

  var controller = document.querySelector('.controller');

  if(controller) {

    var touchstart_x;
    var touchstart_time;

    document.addEventListener('touchstart', (e) => {

      touchstart_x = e.touches[0].pageX;
      touchstart_time = new Date();

    });

    document.addEventListener('touchend', (e) => {

      var touchend_x = e.changedTouches[0].pageX;
      var touchend_time = new Date();
      var touchmove_x = touchend_x - touchstart_x;

      if(Math.abs(touchmove_x) > 100 && touchend_time - touchstart_time < 300) {

        if(touchmove_x < 0) {

          location.assign(controller.getAttribute('data-next'));

        } else {

          location.assign(controller.getAttribute('data-previous'));

        }

      }

    });

    document.addEventListener('keydown', (e) => {

      if(e.keyCode == 39) {

        location.assign(controller.getAttribute('data-next'));

      } else if(e.keyCode == 37) {

        location.assign(controller.getAttribute('data-previous'));

      }

    });

  }

}

export { ready };
