// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.FacebookDialog = (function(_super) {

    __extends(FacebookDialog, _super);

    function FacebookDialog() {
      return FacebookDialog.__super__.constructor.apply(this, arguments);
    }

    FacebookDialog.prototype.inherited = {
      cancelOnOutsideClick: true,
      generic: false,
      overlayClass: "FacebookOverlay"
    };

    return FacebookDialog;

  })(Dialog);

  window.FacebookOverlay = (function(_super) {

    __extends(FacebookOverlay, _super);

    function FacebookOverlay() {
      return FacebookOverlay.__super__.constructor.apply(this, arguments);
    }

    return FacebookOverlay;

  })(Overlay);

  window.FacebookSlideshow = (function(_super) {

    __extends(FacebookSlideshow, _super);

    function FacebookSlideshow() {
      return FacebookSlideshow.__super__.constructor.apply(this, arguments);
    }

    FacebookSlideshow.prototype.inherited = {
      content: "Hello"
    };

    return FacebookSlideshow;

  })(FacebookDialog);

}).call(this);
