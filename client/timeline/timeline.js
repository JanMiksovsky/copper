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

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.CommentItem = (function(_super) {

    __extends(CommentItem, _super);

    function CommentItem() {
      return CommentItem.__super__.constructor.apply(this, arguments);
    }

    CommentItem.prototype.inherited = {
      content: [
        {
          control: HorizontalPanels,
          left: {
            html: "img",
            ref: "picture"
          },
          content: {
            html: "div",
            ref: "CommentItem_content"
          }
        }
      ]
    };

    CommentItem.prototype.content = Control.chain("$CommentItem_content", "content");

    CommentItem.prototype.user = Control.property(function(user) {
      return this.$picture().prop("src", Facebook.pictureUrlForUser(user, 32));
    });

    return CommentItem;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

}).call(this);


/*
The small box with key personal information shown on an FB timeline page,
right below the profile photo.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
              html: "div",
              ref: "coverWrap",
              content: [
                {
                  control: "GoogleImageSearch",
                  ref: "coverPhoto",
                  apiKey: "AIzaSyBv9uyS4BISNFq3Nqy1nEIacR8rZq9mbKQ",
                  searchEngine: "012110630167570475131:yb8gc1mbcwk",
                  imageSize: "xlarge"
                }
              ]
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
                  html: "div",
                  ref: "actions",
                  content: [
                    {
                      control: "FacebookButton",
                      content: "Friends"
                    }, {
                      control: "FacebookButton",
                      content: "Message"
                    }, {
                      control: "FacebookButton",
                      ref: "buttonAbout",
                      content: "What's This?"
                    }
                  ]
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
                    content: [
                      {
                        control: "TimelineAboutTile",
                        ref: "aboutTile"
                      }, {
                        html: "img",
                        ref: "TimelinePage_infoTiles"
                      }
                    ]
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

    TimelinePage.prototype.city = Control.chain("$aboutTile", "city", function(city) {
      return this.$coverPhoto().query("" + city + " skyline");
    });

    TimelinePage.prototype.cityPage = Control.chain("$aboutTile", "cityPage");

    TimelinePage.prototype.college = Control.chain("$aboutTile", "college");

    TimelinePage.prototype.collegePage = Control.chain("$aboutTile", "collegePage");

    TimelinePage.prototype.employer = Control.chain("$aboutTile", "employer");

    TimelinePage.prototype.employerPage = Control.chain("$aboutTile", "employerPage");

    TimelinePage.prototype.infoTiles = Control.chain("$TimelinePage_infoTiles", "prop/src");

    TimelinePage.prototype.initialize = function() {
      var $coverPhoto,
        _this = this;
      this.$buttonAbout().click(function() {
        return Dialog.showDialog(AboutDialog);
      });
      $coverPhoto = this.$coverPhoto();
      return $coverPhoto.load(function() {
        var containerHeight, coverPhotoHeight;
        coverPhotoHeight = $coverPhoto.height();
        containerHeight = _this.$coverWrap().height();
        if (coverPhotoHeight > containerHeight) {
          return $coverPhoto.css("top", (containerHeight - coverPhotoHeight) / 2);
        }
      });
    };

    TimelinePage.prototype.major = Control.chain("$aboutTile", "major");

    TimelinePage.prototype.name = Control.chain("$TimelinePage_name", "content", function(name) {
      return this.$timeline().author(name);
    });

    TimelinePage.prototype.position = Control.chain("$aboutTile", "position");

    TimelinePage.prototype.posts = Control.chain("$timeline", "items");

    TimelinePage.prototype.profilePhoto = Control.chain("$TimelinePage_profilePhoto", "prop/src");

    return TimelinePage;

  })(FacebookPage);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.TimelineUnit = (function(_super) {

    __extends(TimelineUnit, _super);

    function TimelineUnit() {
      return TimelineUnit.__super__.constructor.apply(this, arguments);
    }

    TimelineUnit.prototype.tag = "li";

    return TimelineUnit;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ChatPage = (function(_super) {

    __extends(ChatPage, _super);

    function ChatPage() {
      return ChatPage.__super__.constructor.apply(this, arguments);
    }

    ChatPage.prototype.inherited = {
      content: [
        {
          control: "Log",
          ref: "log"
        }, {
          control: TextBoxWithButton2,
          ref: "userInput"
        }
      ]
    };

    ChatPage.prototype.initialize = function() {
      var _this = this;
      this.$userInput().on("goButtonClick", function() {
        var input, response;
        input = _this.userInput();
        _this.$log().writeln(input);
        response = ChatterBot.respond(input);
        _this.$log().writeln(response);
        return _this.userInput("");
      });
      return this.inDocument(function() {
        return _this.$userInput().find("input").focus();
      });
    };

    ChatPage.prototype.userInput = Control.chain("$userInput", "content");

    return ChatPage;

  })(Page);

}).call(this);

(function() {

  window.ChatterBot = (function() {

    function ChatterBot() {}

    ChatterBot.bestMatch = function(s) {
      var match, pattern, _i, _len, _ref;
      _ref = this.patterns;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pattern = _ref[_i];
        match = pattern.input.exec(s);
        if (match != null) {
          return {
            pattern: pattern,
            match: match
          };
        }
      }
    };

    ChatterBot.respond = function(input) {
      var capture, captures, index, match, pattern, placeholder, response, responses, _i, _len, _ref;
      _ref = this.bestMatch(input), pattern = _ref.pattern, match = _ref.match;
      responses = pattern.output;
      response = $.isArray(responses) ? responses[Math.floor(responses.length * Math.random())] : responses;
      captures = match.slice(1);
      for (index = _i = 0, _len = captures.length; _i < _len; index = ++_i) {
        capture = captures[index];
        placeholder = "$" + (index + 1);
        response = response.replace(placeholder, capture);
      }
      return response;
    };

    return ChatterBot;

  })();

  ChatterBot.patterns = [
    {
      input: /.*(s|S)ubway.*/,
      output: "Ah, that totally makes sense! At one of the rallys, we met a guy who works\nthere. Can you go there and talk to him? The only name we have for\nhim is, \"Peacock\"."
    }, {
      input: /.*(h|H)ello.*/,
      output: "Greetings."
    }, {
      input: /^I (?:wish |would like )(?:I could |I was able to |to be able to )(.*)\./,
      output: "What would it be like to be able to $1?"
    }, {
      input: /I need (.*)\./,
      output: ["Why do you need $1?", "Would it really help you to get $1?", "Are you sure you need $1?"]
    }, {
      input: /^When(.*) stole (.*)\./,
      output: ["What happened when $2 was stolen?", "And how did you feel then?", "Was $2 ever found?"]
    }, {
      input: /Id really like to (.*)\./,
      output: ["If you had the chance to $1, what would happen next?", "Well then, I hope you get to $1."]
    }, {
      input: /Why don't you (.*?)[\?]/,
      output: ["Do you really think I don't $1?", "Perhaps eventually I will $1.", "Do you really want me to $1?"]
    }, {
      input: /Why can't I (.*?)[\?]/,
      output: ["Do you think you should be able to $1?", "If you could $1, what would you do?", "I don't know -- why can't you $1?", "Have you really tried?"]
    }, {
      input: /I can't (.*) you\./,
      output: ["How do you know you can't $1 me?", "Perhaps you could $1 me if you tried.", "What would it take for you to $1 me?"]
    }, {
      input: /I can't (.*)\./,
      output: ["How do you know you can't $1?", "Perhaps you could $1 if you tried.", "What would it take for you to $1?"]
    }, {
      input: /Are you (.*?)[\?]/,
      output: ["Why does it matter whether I am $1?", "Would you prefer it if I were not $1?", "Perhaps you believe I am $1.", "I may be $1 -- what do you think?"]
    }, {
      input: /What (.*?)[\?]/,
      output: ["Why do you ask?", "How would an answer to that help you?", "What do you think?"]
    }, {
      input: /How (.*?)[\?]/,
      output: ["How do you suppose?", "Perhaps you can answer your own question.", "What is it you're really asking?"]
    }, {
      input: /Because (.*)\./,
      output: ["Is that the real reason?", "What other reasons come to mind?", "Does that reason apply to anything else?", "If $1, what else must be true?"]
    }, {
      input: /(.*) sorry (.*)\./,
      output: ["What feelings do you have when you apologize?", "There are many times when no apology is needed."]
    }, {
      input: /I think (.*)\./,
      output: ["Do you doubt $1?", "Do you really think so?", "But you're not sure $1?"]
    }, {
      input: /(.*) friend(.*)\./,
      output: ["Tell me more about your friends.", "When you think of a friend, what comes to mind?", "Why don't you tell me about a childhood friend?"]
    }, {
      input: /Yes\./,
      output: ["You seem quite sure.", "OK, but can you elaborate a bit?"]
    }, {
      input: /(.*) computer(.*)\./,
      output: ["Are you really talking about me?", "Does it seem strange to talk to a computer?", "How do computers make you feel?", "Do you feel threatened by computers?"]
    }, {
      input: /Is it (.*?)[\?]/,
      output: ["Do you think it is $1?", "Perhaps its $1 -- what do you think?", "If it were $1, what would you do?", "It could well be that $1."]
    }, {
      input: /It is (.*)\./,
      output: ["You seem very certain.", "If I told you that it probably isnt $1, what would you feel?"]
    }, {
      input: /Can you (.*) (me |me$).*\?/,
      output: ["Of course I can $1 you.", "Why wouldnt I be able to $1 you?"]
    }, {
      input: /Can you (.*?)[\?]/,
      output: ["What makes you think I can't $1?", "If I could $1, then what?", "Why do you ask if I can $1?"]
    }, {
      input: /Can I (.*?)[\?]/,
      output: ["Perhaps you don't want to $1.", "Do you want to be able to $1?", "If you could $1, would you?"]
    }, {
      input: /You are (.*)\./,
      output: ["Why do you think I am $1?", "Does it please you to think that I'm $1?", "Perhaps you would like me to be $1.", "Perhaps you're really talking about yourself?"]
    }, {
      input: /you're (.*)\./,
      output: ["Why do you say I am $1?", "Why do you think I am $1?", "Are we talking about you, or me?"]
    }, {
      input: /I don't (.*)\./,
      output: ["don't you really $1?", "Why don't you $1?", "Do you want to $1?"]
    }, {
      input: /I feel (.*)\./,
      output: ["Good, tell me more about these feelings.", "Do you often feel $1?", "When do you usually feel $1?", "When you feel $1, what do you do?"]
    }, {
      input: /I have (.*)\./,
      output: ["Why do you tell me that youve $1?", "Have you really $1?", "Now that you have $1, what will you do next?"]
    }, {
      input: /I would (.*)\./,
      output: ["Could you explain why you would $1?", "Why would you $1?", "Who else knows that you would $1?"]
    }, {
      input: /Is there (.*?)[\?]/,
      output: ["Do you think there is $1?", "Its likely that there is $1.", "Would you like there to be $1?"]
    }, {
      input: /My (.*)\./,
      output: ["I see, your $1.", "Why do you say that your $1?", "When your $1, how do you feel?"]
    }, {
      input: /^You (.*)\./,
      output: ["We should be discussing you, not me.", "Why do you say that about me?", "Why do you care whether I $1?"]
    }, {
      input: /Why (.*)\?/,
      output: ["Why do you think $1?", "Why don't you tell me the reason why $1?"]
    }, {
      input: /I want (.*)\./,
      output: ["Why do you want $1?", "What would it mean to you if you got $1?", "What would you do if you got $1?", "If you got $1, then what would you do?"]
    }, {
      input: /.*( the highway| the road).*/,
      output: ["The highway is for gamblers, you better use your sense."]
    }, {
      input: /(.*) mother(.*)\./,
      output: ["What was your relationship with your mother like?", "How do you feel about your mother?", "Tell me more about your mother.", "How does this relate to your feelings today?", "Good family relations are important."]
    }, {
      input: /(.*) father(.*)\./,
      output: ["Tell me more about your father.", "How did your father make you feel?", "How do you feel about your father?", "Does your relationship with your father relate to your feelings today?", "Do you have trouble showing affection with your family?"]
    }, {
      input: /(.*) child(.*)\./,
      output: ["Did you have close friends as a child?", "What is your favorite childhood memory?", "Do you remember any dreams or nightmares from childhood?", "Did the other children sometimes tease you?", "How do you think your childhood experiences relate to your feelings today?"]
    }, {
      input: /(.*) your fav(o|ou)rite(.*?)[\?]/,
      output: ["I really don't have a favorite.", "I have so many favorites its hard to choose one."]
    }, {
      input: /(.*?)[\?]/,
      output: ["Hmm, not sure I know...", "That's a good question...", "Not sure I can answer that...", "Why do you ask that?", "Why don't you tell me?"]
    }, {
      input: /(.*)/,
      output: ["Do you have any hobbies?", "I see, please continue...", "What exactly are we talking about?", "Can you go over that again please?", "Um, I get the feeling this conversation is not going anywhere.", "yeah?", "hmm, is that so...", "Please tell me more.", "Let's change focus a bit... Tell me about your family.", "Can you elaborate on that?", "I see.", "Very interesting.", "I see.  And what does that tell you?", "How does that make you feel?", "How do you feel when you say that?"]
    }
  ];

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.SatelliteDialog = (function(_super) {

    __extends(SatelliteDialog, _super);

    function SatelliteDialog() {
      return SatelliteDialog.__super__.constructor.apply(this, arguments);
    }

    SatelliteDialog.prototype.inherited = {
      content: {
        control: "SatellitePhoto",
        ref: "photo"
      }
    };

    SatelliteDialog.prototype.initialize = function() {
      var address, urlParameters, zoom,
        _this = this;
      urlParameters = Page.urlParameters();
      address = urlParameters.address;
      if (address != null) {
        address = address.replace(/%20/g, " ");
      } else {
        address = Cookie.get("address");
        if (!(address != null)) {
          address = "500 108th Avenue NE # 200, Bellevue, WA";
        }
      }
      this.address(address);
      zoom = urlParameters.zoom;
      if (zoom != null) {
        this.zoom(parseInt(zoom));
      }
      return google.maps.event.addListener(this.$photo().map(), "center_changed", function() {
        return _this.$photo().css("visibility", "visible");
      });
    };

    SatelliteDialog.prototype.address = function(address) {
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

    SatelliteDialog.prototype.location = function(location) {
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

    SatelliteDialog.prototype.map = Control.chain("$photo", "map");

    SatelliteDialog.prototype.zoom = function(zoom) {
      if (zoom === void 0) {
        return this.map().getZoom();
      } else {
        this.map().setZoom(zoom);
        return this;
      }
    };

    return SatelliteDialog;

  })(FacebookDialog);

}).call(this);


/*
Fake satellite photo with Google Maps
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.SatellitePhoto = (function(_super) {

    __extends(SatellitePhoto, _super);

    function SatellitePhoto() {
      return SatellitePhoto.__super__.constructor.apply(this, arguments);
    }

    SatellitePhoto.prototype.inherited = {
      content: [
        {
          control: "GoogleMap",
          ref: "map"
        }, {
          html: "div",
          ref: "caption"
        }, {
          html: "<img src='resources/circle.png'/>",
          ref: "circle",
          "class": "markings"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs1",
          "class": "markings"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs2",
          "class": "markings"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs3",
          "class": "markings"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs4",
          "class": "markings"
        }
      ]
    };

    SatellitePhoto.prototype.initialize = function() {
      var zoomLevel;
      this.$caption().content("DUP Panopticon satellite capture<br/>\n" + (new Date()));
      this.$map().mapTypeId(google.maps.MapTypeId.SATELLITE);
      zoomLevel = this.map().getZoom();
      return this.map().setOptions({
        draggable: false,
        streetViewControl: false,
        tilt: 0,
        minZoom: zoomLevel,
        maxZoom: zoomLevel,
        zoomControl: false
      });
    };

    SatellitePhoto.prototype.map = Control.chain("$map", "map");

    return SatellitePhoto;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.prototype.inherited = {
      content: [
        {
          html: "div",
          content: [
            {
              control: Link,
              ref: "linkUser"
            }, " ", {
              html: "span",
              ref: "Comment_content"
            }
          ]
        }, {
          html: "div",
          ref: "commentLikeBlock",
          content: [
            {
              control: Link,
              content: "Like"
            }
          ]
        }
      ]
    };

    Comment.prototype.content = Control.chain("$Comment_content", "content");

    Comment.prototype.user = function(user) {
      var result,
        _this = this;
      result = Comment.__super__.user.call(this, user);
      if (user !== void 0) {
        Facebook.profileForUser(user, function(profile) {
          return _this.$linkUser().properties({
            content: profile.name,
            href: profile.link
          });
        });
      }
      return result;
    };

    return Comment;

  })(CommentItem);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.CommentComposer = (function(_super) {

    __extends(CommentComposer, _super);

    function CommentComposer() {
      return CommentComposer.__super__.constructor.apply(this, arguments);
    }

    CommentComposer.prototype.inherited = {
      content: {
        control: AutoSizeTextBox,
        ref: "commentTextBox",
        placeholder: "Write a comment..."
      }
    };

    CommentComposer.prototype.comment = function() {
      return {
        user: this.user(),
        content: this.content()
      };
    };

    CommentComposer.prototype.content = Control.chain("$commentTextBox", "content");

    CommentComposer.prototype.initialize = function() {
      var _this = this;
      Facebook.currentUser(function(user) {
        return _this.user(user);
      });
      return this.$commentTextBox().keydown(function(event) {
        var _ref;
        if (event.which === 13) {
          if (((_ref = _this.content()) != null ? _ref.length : void 0) > 0) {
            _this.trigger("saveComment", [_this.comment()]);
          }
          return false;
        }
      });
    };

    return CommentComposer;

  })(CommentItem);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
      employer: "Microsoft Corporation",
      employerPage: "http://www.facebook.com/Microsoft",
      infoTiles: "resources/facebookInfoTiles.png",
      major: "English",
      position: "Project Manager"
    };

    HeroinePage.prototype.initialize = function() {
      var comments, content, control, date, post, posts,
        _this = this;
      this.name(fakeFacebookUsers.heroine.name);
      this.profilePhoto(fakeFacebookUsers.heroine.picture);
      this.on("click", ".satelliteSample", function() {
        return window.location = "satellite.html";
      });
      this.on("click", function(event) {
        if (event.ctrlKey) {
          debugger;
        }
      });
      posts = (function() {
        var _i, _len, _ref, _results;
        _ref = this._posts;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          date = post.date, content = post.content, comments = post.comments;
          control = Control.create().json({
            content: content
          });
          content = control.content();
          _results.push({
            date: date,
            content: content,
            comments: comments
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
          "<p>\nWhile those D.U.P. people were busy combing through Frank's house, he\nmanaged to liberate a USB drive from one of their bags. It had the\nfollowing photos on it. Can anyone help identify where these places are?\nIf we could just figure out what they have in common, we could help put a\nstop to whatever they have planned.\n</p>", {
            html: "<img class='satelliteSample' src='resources/satelliteSample.png'/>"
          }
        ],
        comments: [
          {
            user: "-2",
            content: "I think these are somewhere in Bellevue."
          }
        ]
      }, {
        date: "June 2",
        content: [
          "<p>Nice shot</p>", {
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
          "<p>Wow</p>", {
            control: FlickrInterestingPhoto
          }
        ]
      }, {
        date: "April 3",
        content: "<p>\nI had tix for tonight's show at the Showbox, but there was some sort of\nsecurity checkpoint thing set up on I-5, and it took HOURS to get through\nit. We missed the opening act, and I only got to see half the show. So.\nPissed.\n</p>"
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
          "<p>Love this</p>", {
            control: FlickrInterestingPhoto
          }
        ]
      }, {
        date: "March 19",
        content: "<p>\nMy friends keep bugging me to come back, so I'm going to give Facebook\nanother try.\n</p>"
      }
    ];

    return HeroinePage;

  })(TimelinePage);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
              html: "<img src='resources/profilePhoto.jpg'/>",
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
        }, {
          html: "div",
          ref: "likeBlock",
          content: [
            {
              control: Link,
              content: "Like"
            }, " · ", {
              control: Link,
              content: "Comment"
            }
          ]
        }, {
          control: "List",
          ref: "commentList",
          itemClass: "Comment"
        }, {
          control: "CommentComposer",
          ref: "commentComposer"
        }
      ]
    };

    TimelinePost.prototype.addComment = function(comment) {
      return this.comments(this.comments().concat(comment));
    };

    TimelinePost.prototype.author = Control.chain("$TimelinePost_author", "content");

    TimelinePost.prototype.authorPage = Control.chain("$TimelinePost_author", "href");

    TimelinePost.prototype.comments = Control.chain("$commentList", "items");

    TimelinePost.prototype.content = Control.chain("$TimelinePost_content", "content");

    TimelinePost.prototype.date = Control.chain("$TimelinePost_date", "content");

    TimelinePost.prototype.initialize = function() {
      var _this = this;
      return this.$commentComposer().on("saveComment", function(event, comment) {
        var response;
        _this.addComment(comment);
        _this.$commentComposer().content("");
        response = ChatterBot.respond(comment.content);
        return setTimeout(function() {
          return _this.addComment({
            user: fakeFacebookUsers.heroine,
            content: response
          });
        }, 1000);
      });
    };

    return TimelinePost;

  })(TimelineUnit);

}).call(this);
