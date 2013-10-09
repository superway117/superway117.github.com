(function () {
  var hasTouch = 'ontouchstart' in window,
      startEvent = hasTouch ? 'touchstart' : 'mousedown',
      stopEvent = hasTouch ? 'touchend' : 'mouseup',
      moveEvent = hasTouch ? 'touchmove' : 'mousemove';

  window.VirtualTouch= {
    x: 0,
    y: 0,

    trigger: function (evtName) {
      var $el = $(document.elementFromPoint(this.x, this.y));
      $el.trigger(new $.Event(evtName, {
        pageX: this.x,
        pageY: this.y,
        originalEvent: {
          touches: [{
            pageX: this.x,
            pageY: this.y
          }]
        }
      }));
    },

    click: function () {
      this.trigger('click');
    },

    tapStart: function () {
      this.trigger(startEvent);
    },

    tapEnd: function () {
      this.trigger(stopEvent);
    },

    tap: function () {
      this.tapStart();
      this.tapEnd();
    },

    START_EVENT: startEvent,
    STOP_EVENT: stopEvent,
    MOVE_EVENT: moveEvent
  };
}());