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

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.AboutDialog = (function(_super) {

    __extends(AboutDialog, _super);

    function AboutDialog() {
      return AboutDialog.__super__.constructor.apply(this, arguments);
    }

    AboutDialog.prototype.inherited = {
      cancelOnOutsideClick: true,
      closeOnInsideClick: true,
      content: "<h1>This is a game</h1>\n<p>\nThis game is produced by [SCEA?] and [more legalese here].\nAll characters appearing in this work are fictitious. Any resemblance\nto real persons, living or dead, is purely coincidental.\n</p>",
      width: "500px"
    };

    return AboutDialog;

  })(Dialog);

}).call(this);


/*
Renders the first photo returned by a Google image search query.
This can be useful for generating a placeholder image on a particular theme.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.GoogleImageSearch = (function(_super) {

    __extends(GoogleImageSearch, _super);

    function GoogleImageSearch() {
      return GoogleImageSearch.__super__.constructor.apply(this, arguments);
    }

    GoogleImageSearch.prototype.inherited = {
      content: "search result goes here"
    };

    GoogleImageSearch.prototype.apiKey = Control.property(function() {
      return this._refresh();
    });

    GoogleImageSearch.prototype.imageSize = Control.property();

    GoogleImageSearch.prototype.query = Control.property(function() {
      return this._refresh();
    });

    GoogleImageSearch.prototype.searchEngine = Control.property(function() {
      return this._refresh();
    });

    GoogleImageSearch.prototype.tag = "img";

    GoogleImageSearch.prototype._refresh = function() {
      var apiKey, imageSize, query, searchEngine, sizeParam, url,
        _this = this;
      apiKey = this.apiKey();
      query = this.query();
      searchEngine = this.searchEngine();
      if (!((apiKey != null) && (query != null) && (searchEngine != null))) {
        return;
      }
      imageSize = this.imageSize();
      sizeParam = imageSize != null ? "imgSize=" + imageSize : "";
      url = "https://www.googleapis.com/customsearch/v1?key=" + apiKey + "&cx=" + searchEngine + "&q=" + query + "&searchType=image&imgType=photo&" + sizeParam + "&num=1&alt=json&callback=?";
      return $.getJSON(url, function(data) {
        var _ref;
        if ((data != null ? (_ref = data.items) != null ? _ref.length : void 0 : void 0) > 0) {
          return _this.prop("src", data.items[0].link);
        }
      });
    };

    return GoogleImageSearch;

  })(Control);

}).call(this);


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
      this.map(map);
      if (!(this.mapTypeId() != null)) {
        return this.mapTypeId(google.maps.MapTypeId.ROADMAP);
      }
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
    });

    GoogleMap.prototype._unsupported = function() {};

    return GoogleMap;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.TextBoxWithButton2 = (function(_super) {

    __extends(TextBoxWithButton2, _super);

    function TextBoxWithButton2() {
      return TextBoxWithButton2.__super__.constructor.apply(this, arguments);
    }

    TextBoxWithButton2.prototype.inherited = {
      content: {
        control: HorizontalPanels,
        content: {
          control: TextBox,
          ref: "TextBoxWithButton_textBox"
        },
        right: {
          control: BasicButton,
          ref: "TextBoxWithButton_goButton",
          content: "Go"
        }
      }
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


/*
Cookie utility functions

These are for cookies shared across pages within a single domain.
*/


(function() {

  window.Cookie = (function() {

    function Cookie() {}

    Cookie.cookies = function() {
      var assignment, cookies, documentCookie, key, parts, value, _i, _len, _ref;
      documentCookie = document.cookie;
      cookies = {};
      if ((documentCookie != null ? documentCookie.length : void 0) > 0) {
        _ref = documentCookie.split(";");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          assignment = _ref[_i];
          parts = assignment.split("=");
          key = parts[0].trim();
          value = unescape(parts[1].trim());
          cookies[key] = value;
        }
      }
      return cookies;
    };

    Cookie["delete"] = function(key) {
      return document.cookie = "" + key + ";path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    };

    Cookie.get = function(key) {
      return Cookie.cookies()[key];
    };

    Cookie.set = function(key, value) {
      var escaped;
      escaped = escape(value);
      return document.cookie = "" + key + "=" + escaped + ";path=/";
    };

    return Cookie;

  })();

}).call(this);


/*
General-purpose utility functions
*/


(function() {

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

    Utilities.unique = function(array) {
      var item, result, _i, _len;
      result = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if ($.inArray(item, result) < 0) {
          result.push(item);
        }
      }
      return result;
    };

    return Utilities;

  })();

  $(function() {
    return Math.seedrandom();
  });

}).call(this);


/*
Wrap access to Facebook.
*/


(function() {

  window.Facebook = (function() {

    function Facebook() {}

    Facebook.accessToken = function() {
      return Page.urlParameters().access_token;
    };

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
      return this._cachedFacebookCall("me", null, callback);
    };

    Facebook.currentUserFriends = function(callback) {
      var _this = this;
      return this._cachedFacebookCall("me/friends", null, function(result) {
        return callback(result.data);
      });
    };

    Facebook.isFakeUser = function(user) {
      var id, _ref;
      id = (_ref = user.id) != null ? _ref : user;
      return parseInt(id) < 0;
    };

    Facebook.pictureUrlForUser = function(user, size) {
      var id, _ref;
      id = (_ref = user.id) != null ? _ref : user;
      if (Facebook.isFakeUser(user)) {
        return fakeFacebookUsers[id].picture;
      }
      size = size != null ? size : 160;
      return "" + this._baseUrl + id + "/picture?access_token=" + (this.accessToken()) + "&height=" + size + "&width=" + size;
    };

    Facebook.profileForUser = function(user, callback) {
      var id, _ref;
      id = (_ref = user.id) != null ? _ref : user;
      if (Facebook.isFakeUser(user)) {
        return callback(fakeFacebookUsers[id]);
      } else {
        return this._cachedFacebookCall(id, null, callback);
      }
    };

    Facebook.url = function(path, params) {
      var paramList;
      paramList = params != null ? "?" + params.join("&") : "";
      return "" + this._baseUrl + path + paramList;
    };

    Facebook._baseUrl = "https://graph.facebook.com/";

    Facebook._cache = {};

    Facebook._cachedFacebookCall = function(path, params, callback) {
      var key;
      key = this.url(path, params);
      if (Facebook._cache[key]) {
        return callback(Facebook._cache[key]);
      } else {
        return this._facebookCall(path, params, function(result) {
          Facebook._cache[key] = result;
          return callback(result);
        });
      }
    };

    Facebook._facebookCall = function(path, params, callback) {
      var callParams, url;
      callParams = ["access_token=" + (this.accessToken()), "callback=?"];
      params = params != null ? callParams.concat(params) : callParams;
      url = this.url(path, params);
      return $.getJSON(url, function(result) {
        if (result.error == null) {
          return callback(result);
        }
      });
    };

    return Facebook;

  })();

}).call(this);

(function() {

  window.FacebookApplication = (function() {

    function FacebookApplication() {}

    FacebookApplication.id = function() {
      if (window.location.hostname === "localhost") {
        return "407741369292793";
      } else {
        return "400736616662108";
      }
    };

    return FacebookApplication;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.FacebookButton = (function(_super) {

    __extends(FacebookButton, _super);

    function FacebookButton() {
      return FacebookButton.__super__.constructor.apply(this, arguments);
    }

    return FacebookButton;

  })(BasicButton);

}).call(this);

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

}).call(this);

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

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.FacebookOverlay = (function(_super) {

    __extends(FacebookOverlay, _super);

    function FacebookOverlay() {
      return FacebookOverlay.__super__.constructor.apply(this, arguments);
    }

    FacebookOverlay.prototype.initialize = function() {
      var _this = this;
      return this.on("DOMMouseScroll mousewheel", function(event) {
        return event.preventDefault();
      });
    };

    return FacebookOverlay;

  })(Overlay);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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


/*
Database of fake Facebook users.
These are all identified with negative ID numbers.
*/


(function() {
  var fakeUser, fakeUserId;

  window.fakeFacebookUsers = {
    "-1": {
      name: "Ann Williams",
      link: "timeline.html",
      picture: "resources/profilePhoto.jpg"
    },
    "-2": {
      name: "Cody Kuether",
      link: "PAGEGOESHERE",
      picture: "resources/pictures/male3.jpg"
    }
  };

  for (fakeUserId in fakeFacebookUsers) {
    fakeUser = fakeFacebookUsers[fakeUserId];
    fakeUser.id = fakeUserId;
  }

  fakeFacebookUsers.heroine = fakeFacebookUsers["-1"];

}).call(this);


/*
Top-level page for Karma game.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.KarmaPage = (function(_super) {

    __extends(KarmaPage, _super);

    function KarmaPage() {
      return KarmaPage.__super__.constructor.apply(this, arguments);
    }

    KarmaPage.prototype.inherited = {
      content: ["Karma page content goes here..."]
    };

    return KarmaPage;

  })(FacebookPage);

}).call(this);
