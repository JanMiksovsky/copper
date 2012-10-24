// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */
(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  [],   // pool: entropy pool starts empty
  Math, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
);

// Generated by CoffeeScript 1.3.3

/*
Cookie utility functions
*/


(function() {

  window.Cookie = (function() {

    function Cookie() {}

    Cookie.cookies = function() {
      var assignment, cookies, key, parts, value, _i, _len, _ref;
      cookies = {};
      _ref = document.cookie.split(";");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        assignment = _ref[_i];
        parts = assignment.split("=");
        key = parts[0].trim();
        value = unescape(parts[1].trim());
        cookies[key] = value;
      }
      return cookies;
    };

    Cookie.get = function(key) {
      return Cookie.cookies()[key];
    };

    Cookie.set = function(key, value) {
      var escaped;
      escaped = escape(value);
      return document.cookie = "" + key + "=" + escaped;
    };

    return Cookie;

  })();

  window.Utilities = (function() {

    function Utilities() {}

    Utilities.shuffle = function(array) {
      var copy, i, j, temp, _i, _ref;
      copy = array.slice();
      for (i = _i = _ref = copy.length - 1; _ref <= 1 ? _i <= 1 : _i >= 1; i = _ref <= 1 ? ++_i : --_i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    };

    return Utilities;

  })();

  $(function() {
    return Math.seedrandom();
  });

}).call(this);

// Generated by CoffeeScript 1.3.3

/*
A Google map.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.GoogleMap = (function(_super) {

    __extends(GoogleMap, _super);

    function GoogleMap() {
      return GoogleMap.__super__.constructor.apply(this, arguments);
    }

    GoogleMap.prototype.address = function(address) {
      var geocoder,
        _this = this;
      geocoder = new google.maps.Geocoder();
      return geocoder.geocode({
        address: address
      }, function(data) {
        var result, results, status;
        results = data[0], status = data[1];
        if (!(status != null) || status === "OK") {
          result = results.length > 0 ? results[0] : results;
          return _this.center(result.geometry.location);
        }
      });
    };

    GoogleMap.prototype.inherited = {
      content: {
        html: "div",
        ref: "canvas"
      }
    };

    GoogleMap.prototype.initialize = function() {
      var canvas, map, options;
      canvas = this.$canvas()[0];
      options = {
        zoom: 18,
        mapTypeControl: false,
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: this.mapTypeId()
      };
      map = new google.maps.Map(canvas, options);
      return this.map(map);
    };

    GoogleMap.prototype.center = function(latLng) {
      if (latLng === void 0) {
        return this.map().getCenter();
      } else {
        this.map().setCenter(latLng);
        return this;
      }
    };

    GoogleMap.prototype.map = Control.property();

    GoogleMap.prototype.mapTypeId = Control.property(function(mapTypeId) {
      var _ref;
      return (_ref = this.map()) != null ? _ref.setMapTypeId(mapTypeId) : void 0;
    }, google.maps.MapTypeId.ROADMAP);

    GoogleMap.prototype._unsupported = function() {};

    return GoogleMap;

  })(Control);

  window.TextBoxWithButton2 = (function(_super) {

    __extends(TextBoxWithButton2, _super);

    function TextBoxWithButton2() {
      return TextBoxWithButton2.__super__.constructor.apply(this, arguments);
    }

    TextBoxWithButton2.prototype.inherited = {
      content: [
        {
          control: TextBox,
          ref: "TextBoxWithButton_textBox"
        }, {
          control: BasicButton,
          ref: "TextBoxWithButton_goButton",
          content: "Go"
        }
      ]
    };

    TextBoxWithButton2.prototype.content = function(value) {
      var result;
      result = this.$TextBoxWithButton_textBox().content(value);
      if (value !== void 0) {
        this._disableGoButtonIfContentEmpty();
      }
      return result;
    };

    TextBoxWithButton2.prototype.goButton = Control.chain("$TextBoxWithButton_goButton", "control");

    TextBoxWithButton2.prototype.initialize = function() {
      var _this = this;
      this.$TextBoxWithButton_textBox().on("change keydown keyup", function(event) {
        var keyCode;
        _this._disableGoButtonIfContentEmpty();
        keyCode = event.keyCode || event.which;
        if (!_this._isContentEmpty() && keyCode === 13) {
          return _this.trigger("goButtonClick");
        }
      });
      this.$TextBoxWithButton_goButton().click(function() {
        return _this.trigger("goButtonClick");
      });
      return this._disableGoButtonIfContentEmpty();
    };

    TextBoxWithButton2.prototype.textBox = Control.chain("$TextBoxWithButton_textBox", "control");

    TextBoxWithButton2.prototype._disableGoButtonIfContentEmpty = function() {
      var content, goButton;
      content = this.content();
      goButton = this.goButton();
      if ((goButton != null) && goButton instanceof BasicButton) {
        return goButton.disabled(this._isContentEmpty());
      }
    };

    TextBoxWithButton2.prototype._isContentEmpty = function() {
      var content;
      content = this.content();
      return !(content != null) || content.length === 0;
    };

    return TextBoxWithButton2;

  })(Control);

}).call(this);

// Generated by CoffeeScript 1.3.3

/*
Wrap access to Facebook.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Facebook = (function() {

    function Facebook() {}

    Facebook.authorize = function(applicationId, redirectUri, scopes, params) {
      var scopesParam, url;
      scopesParam = scopes != null ? scopes.join(",") : "";
      url = "https://graph.facebook.com/oauth/authorize?client_id=" + applicationId + "&scope=" + scopesParam + "&type=user_agent&display=page&redirect_uri=" + redirectUri;
      params = params || [];
      params.push("applicationId=" + applicationId);
      url += "?" + escape(params.join("&"));
      return window.location = url;
    };

    Facebook.currentUser = function(callback) {
      return this._call("me", null, callback);
    };

    Facebook.currentUserFriends = function(callback) {
      var _this = this;
      return this._call("me/friends", null, function(result) {
        return callback(result.data);
      });
    };

    Facebook.pictureUrlForUser = function(user) {
      this._getAccessToken();
      return "" + this._baseUrl + user.id + "/picture?access_token=" + this.accessToken + "&height=160&width=160";
    };

    Facebook._baseUrl = "https://graph.facebook.com/";

    Facebook._call = function(path, params, callback) {
      var callParamList, callParams, url;
      this._getAccessToken();
      callParams = ["access_token=" + this.accessToken, "callback=?"];
      if (params) {
        callParams = callParams.concat(params);
      }
      callParamList = callParams.join("&");
      url = "" + this._baseUrl + path + "?" + callParamList;
      return $.getJSON(url, function(result) {
        if (result.error == null) {
          return callback(result);
        }
      });
    };

    Facebook._getAccessToken = function() {
      if (!(this.accessToken != null)) {
        return this.accessToken = Page.urlParameters().access_token;
      }
    };

    return Facebook;

  })();

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
      content: {
        control: HorizontalPanels,
        content: {
          html: "div",
          ref: "FacebookSlideshow_content"
        },
        right: {
          html: "div",
          ref: "rightPane",
          content: "Hello, world"
        }
      },
      visibility: false
    };

    FacebookSlideshow.prototype.content = Control.chain("$FacebookSlideshow_content", "content");

    FacebookSlideshow.prototype.initialize = function() {
      var _this = this;
      return this.$photo().load(function() {
        return _this.visibility(true);
      });
    };

    return FacebookSlideshow;

  })(FacebookDialog);

}).call(this);

// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.SatellitePage = (function(_super) {

    __extends(SatellitePage, _super);

    function SatellitePage() {
      return SatellitePage.__super__.constructor.apply(this, arguments);
    }

    SatellitePage.prototype.inherited = {
      content: {
        control: "SatellitePhoto",
        ref: "photo"
      }
    };

    SatellitePage.prototype.initialize = function() {
      var address, urlParameters, zoom, _ref,
        _this = this;
      urlParameters = Page.urlParameters();
      address = (_ref = urlParameters.address) != null ? _ref : "500 108th Avenue NE # 200, Bellevue, WA";
      address = address.replace(/%20/g, " ");
      this.address(address);
      zoom = urlParameters.zoom;
      if (zoom != null) {
        this.zoom(parseInt(zoom));
      }
      return google.maps.event.addListener(this.$photo().map(), "center_changed", function() {
        return _this.$photo().css("visibility", "visible");
      });
    };

    SatellitePage.prototype.address = function(address) {
      var geocoder,
        _this = this;
      geocoder = new google.maps.Geocoder();
      return geocoder.geocode({
        address: address
      }, function(data) {
        var result, results, status;
        results = data[0], status = data[1];
        result = results.length > 0 ? results[0] : results;
        return _this.location(result.geometry.location);
      });
    };

    SatellitePage.prototype.location = function(location) {
      var map, placesService, request,
        _this = this;
      map = this.map();
      placesService = new google.maps.places.PlacesService(map);
      request = {
        keyword: "Subway",
        location: location,
        rankBy: google.maps.places.RankBy.DISTANCE
      };
      return placesService.search(request, function(results) {
        var result;
        if ((results != null ? results.length : void 0) > 0) {
          result = results[0];
          return map.setCenter(result.geometry.location);
        }
      });
    };

    SatellitePage.prototype.map = Control.chain("$photo", "map");

    SatellitePage.prototype.zoom = function(zoom) {
      if (zoom === void 0) {
        return this.map().getZoom();
      } else {
        this.map().setZoom(zoom);
        return this;
      }
    };

    return SatellitePage;

  })(Control);

  /*
  Fake satellite photo with Google Maps
  */


  window.SatellitePhoto = (function(_super) {

    __extends(SatellitePhoto, _super);

    function SatellitePhoto() {
      return SatellitePhoto.__super__.constructor.apply(this, arguments);
    }

    SatellitePhoto.prototype.inherited = {
      content: [
        {
          control: "GoogleMap",
          ref: "map",
          mapTypeId: google.maps.MapTypeId.SATELLITE
        }, {
          html: "div",
          ref: "caption"
        }, {
          html: "<img src='../resources/crosshairs.png'/>",
          ref: "crosshairs1",
          "class": "crosshairs"
        }, {
          html: "<img src='../resources/crosshairs.png'/>",
          ref: "crosshairs2",
          "class": "crosshairs"
        }, {
          html: "<img src='../resources/crosshairs.png'/>",
          ref: "crosshairs3",
          "class": "crosshairs"
        }, {
          html: "<img src='../resources/crosshairs.png'/>",
          ref: "crosshairs4",
          "class": "crosshairs"
        }
      ]
    };

    SatellitePhoto.prototype.initialize = function() {
      this.$caption().content("DUP Panopticon satellite capture<br/>\n" + (new Date()));
      return this.map().setOptions({
        draggable: false,
        streetViewControl: false,
        tilt: 0,
        zoomControl: false
      });
    };

    SatellitePhoto.prototype.map = Control.chain("$map", "map");

    return SatellitePhoto;

  })(Control);

}).call(this);

// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.FacebookIcon = (function(_super) {

    __extends(FacebookIcon, _super);

    function FacebookIcon() {
      return FacebookIcon.__super__.constructor.apply(this, arguments);
    }

    FacebookIcon.prototype.tag = "span";

    return FacebookIcon;

  })(Control);

  window.FacebookPage = (function(_super) {

    __extends(FacebookPage, _super);

    function FacebookPage() {
      return FacebookPage.__super__.constructor.apply(this, arguments);
    }

    FacebookPage.prototype.inherited = {
      generic: false,
      content: [
        {
          html: "div",
          ref: "globalContainer",
          content: [
            {
              html: "div",
              ref: "contentArea",
              content: [
                {
                  html: "div",
                  ref: "FacebookPage_content"
                }
              ]
            }
          ]
        }
      ]
    };

    FacebookPage.prototype.content = Control.chain("$FacebookPage_content", "content");

    return FacebookPage;

  })(Page);

  window.Timeline = (function(_super) {

    __extends(Timeline, _super);

    function Timeline() {
      return Timeline.__super__.constructor.apply(this, arguments);
    }

    Timeline.prototype.inherited = {
      "class": "clearfix",
      itemClass: "TimelinePost"
    };

    Timeline.prototype.author = Control.property();

    Timeline.prototype.tag = "ol";

    Timeline.prototype._setupControl = function(control) {
      control.author(this.author());
      return control.authorPage(".");
    };

    return Timeline;

  })(List);

  /*
  The small box with key personal information shown on an FB timeline page,
  right below the profile photo.
  */


  window.TimelineAboutTile = (function(_super) {

    __extends(TimelineAboutTile, _super);

    function TimelineAboutTile() {
      return TimelineAboutTile.__super__.constructor.apply(this, arguments);
    }

    TimelineAboutTile.prototype.inherited = {
      content: {
        html: "div",
        ref: "fbTimelineSummarySectionWrapper",
        content: {
          html: "div",
          ref: "detail",
          content: {
            html: "div",
            ref: "mat",
            content: {
              html: "div",
              ref: "fbTimelineSummarySection",
              content: [
                {
                  html: "div",
                  ref: "fbProfileBylineFragment",
                  content: [
                    {
                      control: "FacebookIcon",
                      ref: "workIcon"
                    }, {
                      html: "span",
                      ref: "TimelinePage_position"
                    }, " at ", {
                      control: "Link",
                      ref: "TimelinePage_employer"
                    }
                  ]
                }, {
                  html: "div",
                  ref: "fbProfileBylineFragment",
                  content: [
                    {
                      control: "FacebookIcon",
                      ref: "collegeIcon"
                    }, "Studied ", {
                      html: "span",
                      ref: "TimelinePage_major"
                    }, " at ", {
                      control: "Link",
                      ref: "TimelinePage_college"
                    }
                  ]
                }, {
                  html: "div",
                  ref: "fbProfileBylineFragment",
                  content: [
                    {
                      control: "FacebookIcon",
                      ref: "cityIcon"
                    }, "Lives in ", {
                      control: "Link",
                      ref: "TimelinePage_city"
                    }
                  ]
                }, {
                  html: "div",
                  ref: "fbProfileBylineFragment",
                  content: [
                    {
                      control: "FacebookIcon",
                      ref: "birthdayIcon"
                    }, "Born on ", {
                      html: "span",
                      ref: "TimelinePage_birthday"
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    };

    TimelineAboutTile.prototype.birthday = Control.chain("$TimelinePage_birthday", "content");

    TimelineAboutTile.prototype.city = Control.chain("$TimelinePage_city", "content");

    TimelineAboutTile.prototype.cityPage = Control.chain("$TimelinePage_city", "href");

    TimelineAboutTile.prototype.college = Control.chain("$TimelinePage_college", "content");

    TimelineAboutTile.prototype.collegePage = Control.chain("$TimelinePage_college", "href");

    TimelineAboutTile.prototype.employer = Control.chain("$TimelinePage_employer", "content");

    TimelineAboutTile.prototype.employerPage = Control.chain("$TimelinePage_employer", "href");

    TimelineAboutTile.prototype.major = Control.chain("$TimelinePage_major", "content");

    TimelineAboutTile.prototype.position = Control.chain("$TimelinePage_position", "content");

    return TimelineAboutTile;

  })(Control);

  window.TimelinePage = (function(_super) {

    __extends(TimelinePage, _super);

    function TimelinePage() {
      return TimelinePage.__super__.constructor.apply(this, arguments);
    }

    TimelinePage.prototype.inherited = {
      content: [
        {
          html: "div",
          ref: "fbTimelineSection",
          content: [
            {
              html: "img",
              ref: "TimelinePage_coverPhoto"
            }, {
              html: "div",
              ref: "fbTimelineHeadline",
              content: [
                {
                  html: "div",
                  ref: "photoContainer",
                  content: {
                    html: "div",
                    ref: "profilePicThumb",
                    content: {
                      html: "div",
                      ref: "uiScaledImageContainer",
                      content: {
                        html: "img",
                        ref: "TimelinePage_profilePhoto"
                      }
                    }
                  }
                }, {
                  html: "h2",
                  ref: "TimelinePage_name"
                }
              ]
            }, {
              html: "div",
              ref: "fbTimelineNavigationPagelet",
              content: {
                html: "div",
                ref: "TimelineNavContent",
                content: {
                  html: "div",
                  ref: "fbTimelineNavigation",
                  content: {
                    html: "div",
                    ref: "fbTimelineTopRow",
                    content: {
                      control: "TimelineAboutTile",
                      ref: "aboutTile"
                    }
                  }
                }
              }
            }
          ]
        }, {
          control: "Timeline",
          ref: "timeline"
        }
      ]
    };

    TimelinePage.prototype.birthday = Control.chain("$aboutTile", "birthday");

    TimelinePage.prototype.city = Control.chain("$aboutTile", "city");

    TimelinePage.prototype.cityPage = Control.chain("$aboutTile", "cityPage");

    TimelinePage.prototype.college = Control.chain("$aboutTile", "college");

    TimelinePage.prototype.collegePage = Control.chain("$aboutTile", "collegePage");

    TimelinePage.prototype.coverPhoto = Control.chain("$TimelinePage_coverPhoto", "prop/src");

    TimelinePage.prototype.employer = Control.chain("$aboutTile", "employer");

    TimelinePage.prototype.employerPage = Control.chain("$aboutTile", "employerPage");

    TimelinePage.prototype.major = Control.chain("$aboutTile", "major");

    TimelinePage.prototype.name = Control.chain("$TimelinePage_name", "content", function(name) {
      return this.$timeline().author(name);
    });

    TimelinePage.prototype.position = Control.chain("$aboutTile", "position");

    TimelinePage.prototype.posts = Control.chain("$timeline", "items");

    TimelinePage.prototype.profilePhoto = Control.chain("$TimelinePage_profilePhoto", "prop/src");

    return TimelinePage;

  })(FacebookPage);

  window.TimelineUnit = (function(_super) {

    __extends(TimelineUnit, _super);

    function TimelineUnit() {
      return TimelineUnit.__super__.constructor.apply(this, arguments);
    }

    TimelineUnit.prototype.tag = "li";

    return TimelineUnit;

  })(Control);

  window.HeroinePage = (function(_super) {

    __extends(HeroinePage, _super);

    function HeroinePage() {
      return HeroinePage.__super__.constructor.apply(this, arguments);
    }

    HeroinePage.prototype.inherited = {
      birthday: "November 12",
      city: "Bellevue, Washington",
      cityPage: "http://www.facebook.com/pages/Bellevue-Washington/111723635511834",
      college: "Harvey Mudd College",
      collegePage: "http://www.facebook.com/pages/Harvey-Mudd-College/107892159239091",
      coverPhoto: "../resources/coverPhoto.jpg",
      employer: "Microsoft Corporation",
      employerPage: "http://www.facebook.com/Microsoft",
      major: "English",
      name: "Ann Williams",
      position: "Project Manager",
      profilePhoto: "../resources/profilePhoto.jpg"
    };

    HeroinePage.prototype.initialize = function() {
      var content, control, date, post, posts,
        _this = this;
      this.on("click", ".satelliteSample", function() {
        return window.location = "../agent/satellite.html";
      });
      posts = (function() {
        var _i, _len, _ref, _results;
        _ref = this._posts;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          date = post.date, content = post.content;
          control = Control.create().json({
            content: content
          });
          content = control.content();
          _results.push({
            date: date,
            content: content
          });
        }
        return _results;
      }).call(this);
      return this.posts(posts);
    };

    HeroinePage.prototype._posts = [
      {
        date: "July 10",
        content: [
          "Apparently those government people are interested in these places, but\nwe don't know where they are. If we could just figure out what they have\nin common, we could help put a stop to whatever they have planned. Can\nanyone help?", {
            html: "<img class='satelliteSample' src='../resources/satelliteSample.png'/>"
          }
        ]
      }, {
        date: "June 2",
        content: [
          {
            control: LoremIpsum,
            sentences: 1
          }, {
            control: FlickrInterestingPhoto
          }
        ]
      }, {
        date: "May 20",
        content: {
          control: LoremIpsum
        }
      }, {
        date: "May 15",
        content: {
          control: LoremIpsum,
          sentences: 1
        }
      }, {
        date: "April 27",
        content: {
          control: FlickrInterestingPhoto
        }
      }, {
        date: "April 8",
        content: [
          {
            control: LoremIpsum,
            sentences: 1
          }, {
            control: FlickrInterestingPhoto
          }
        ]
      }, {
        date: "April 3",
        content: "I had tix for tonight's show at the Showbox, but there was\nsome sort of security checkpoint thing set up on I-5, and it took HOURS\nto get through it. We missed the opening act, and I only show half the\nshow. So. Pissed."
      }, {
        date: "March 29",
        content: {
          control: LoremIpsum
        }
      }, {
        date: "March 22",
        content: {
          control: LoremIpsum
        }
      }, {
        date: "March 21",
        content: [
          "Love this", {
            control: FlickrInterestingPhoto
          }
        ]
      }, {
        date: "March 19",
        content: "My friends keep bugging me to come back, so I'm going to give Facebook\nanother try."
      }
    ];

    return HeroinePage;

  })(TimelinePage);

  window.TimelinePost = (function(_super) {

    __extends(TimelinePost, _super);

    function TimelinePost() {
      return TimelinePost.__super__.constructor.apply(this, arguments);
    }

    TimelinePost.prototype.inherited = {
      content: [
        {
          html: "div",
          ref: "byline",
          "class": "clearfix",
          content: [
            {
              html: "<img src='../resources/profilePhoto.jpg'/>",
              ref: "profilePhoto"
            }, {
              html: "div",
              ref: "authorBlock",
              content: [
                {
                  control: Link,
                  ref: "TimelinePost_author"
                }, {
                  html: "div",
                  ref: "TimelinePost_date"
                }
              ]
            }
          ]
        }, {
          html: "div",
          ref: "TimelinePost_content"
        }
      ]
    };

    TimelinePost.prototype.author = Control.chain("$TimelinePost_author", "content");

    TimelinePost.prototype.authorPage = Control.chain("$TimelinePost_author", "href");

    TimelinePost.prototype.content = Control.chain("$TimelinePost_content", "content");

    TimelinePost.prototype.date = Control.chain("$TimelinePost_date", "content");

    return TimelinePost;

  })(TimelineUnit);

}).call(this);
