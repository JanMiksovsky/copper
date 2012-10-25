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

    FacebookOverlay.prototype.initialize = function() {
      var _this = this;
      return this.on("DOMMouseScroll mousewheel", function(event) {
        return event.preventDefault();
      });
    };

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

  window.DupPage = (function(_super) {

    __extends(DupPage, _super);

    function DupPage() {
      return DupPage.__super__.constructor.apply(this, arguments);
    }

    DupPage.prototype.inherited = {
      title: "Dept. of Unified Protection",
      content: [
        {
          html: "div",
          ref: "header",
          content: [
            {
              html: "div",
              ref: "titleElements",
              "class": "container",
              content: [
                {
                  html: "<img src='resources/dupLogo.png'/>",
                  ref: "logo"
                }, {
                  html: "h1",
                  ref: "DupPage_title"
                }
              ]
            }
          ]
        }, {
          html: "div",
          ref: "contentContainer",
          "class": "container",
          content: [
            {
              html: "div",
              ref: "DupPage_content"
            }
          ]
        }
      ]
    };

    DupPage.prototype.accessToken = function() {
      return Page.urlParameters().access_token;
    };

    DupPage.prototype.applicationId = function() {
      return Page.urlParameters().applicationId;
    };

    DupPage.prototype.content = Control.chain("$DupPage_content", "content");

    DupPage.prototype.header = Control.chain("$DupPage_header", "content");

    DupPage.prototype.navigateWithAccessToken = function(url) {
      return window.location = "" + url + "?access_token=" + (this.accessToken());
    };

    DupPage.prototype.title = function(title) {
      var result;
      result = DupPage.__super__.title.call(this, title);
      if (title !== void 0) {
        this.$DupPage_title().content(title);
      }
      return result;
    };

    return DupPage;

  })(Page);

  window.FieldWithNotice = (function(_super) {

    __extends(FieldWithNotice, _super);

    function FieldWithNotice() {
      return FieldWithNotice.__super__.constructor.apply(this, arguments);
    }

    FieldWithNotice.prototype.inherited = {
      content: [
        {
          html: "div",
          ref: "FieldWithNotice_content"
        }, {
          control: "Notice",
          ref: "FieldWithNotice_notice",
          toggle: false
        }
      ],
      generic: true
    };

    FieldWithNotice.prototype.content = Control.chain("$FieldWithNotice_content", "content");

    FieldWithNotice.prototype.notice = Control.chain("$FieldWithNotice_notice", "content");

    FieldWithNotice.prototype.toggleNotice = Control.chain("$FieldWithNotice_notice", "toggle");

    return FieldWithNotice;

  })(Control);

  window.HomePage = (function(_super) {

    __extends(HomePage, _super);

    function HomePage() {
      return HomePage.__super__.constructor.apply(this, arguments);
    }

    HomePage.prototype.inherited = {
      content: [
        "<p>All citizens must register</p>", {
          control: BasicButton,
          ref: "buttonRegister",
          content: "Register now"
        }, {
          html: "p",
          content: {
            control: Link,
            ref: "linkAbout",
            content: "What's this?"
          }
        }
      ],
      title: "Department of Unified Protection"
    };

    HomePage.prototype.initialize = function() {
      var _this = this;
      this.$buttonRegister().click(function() {
        return _this.register();
      });
      return this.$linkAbout().click(function() {
        return Dialog.showDialog(Dialog, {
          cancelOnOutsideClick: true,
          closeOnInsideClick: true,
          content: "<h1>This is a game</h1>\n<p>\nThis game is produced by [SCEA?] and [more legalese here].\nAll characters appearing in this work are fictitious. Any resemblance\nto real persons, living or dead, is purely coincidental.\n</p>",
          width: "500px"
        });
      });
    };

    HomePage.prototype.register = function() {
      var parts, url;
      parts = window.location.href.split("/");
      parts[parts.length - 1] = "register.html";
      url = parts.join("/");
      return Facebook.authorize("136995693107715", url, ["email", "user_birthday"]);
    };

    HomePage.prototype.test = function() {
      var _this = this;
      return $.post("http://localhost:5000/verify/jan@miksovsky.com", null, function(data) {
        debugger;
      });
    };

    return HomePage;

  })(DupPage);

  window.Notice = (function(_super) {

    __extends(Notice, _super);

    function Notice() {
      return Notice.__super__.constructor.apply(this, arguments);
    }

    Notice.prototype.inherited = {
      generic: true
    };

    Notice.prototype.tag = "p";

    return Notice;

  })(Control);

  window.ReferralPage = (function(_super) {

    __extends(ReferralPage, _super);

    function ReferralPage() {
      return ReferralPage.__super__.constructor.apply(this, arguments);
    }

    ReferralPage.prototype.inherited = {
      content: [
        "<p>\nThe nationwide Citizen Watch Program assists the Department of Unified\nProtection in identifying citizens of interest to security investigations.\nAll citizens are periodically required to review photographs of suspicious\nindividuals and indicate any associations with individuals they know.\n</p>", "<h2>Your Security Begins with Cooperation</h2>", "<p>\nPlease identify one of the following:\n</p>", {
          control: "SuspectList",
          ref: "suspectList"
        }, {
          html: "p",
          content: [
            "If you do not recognize any of the individuals shown, you may request to ", {
              control: Link,
              ref: "linkReload",
              content: "view more photos"
            }, "."
          ]
        }, {
          html: "p",
          content: [
            "It is imperative that you identify at least one individual you know so\nthat we may carry out our mission to keep our nation secure. If you\nabstain from making a selection, your failure to comply may subject you,\nyour family, and your associates to investigation and/or indefinite\nincarceration. ", {
              control: Link,
              ref: "linkAbstain",
              content: "Abstain"
            }
          ]
        }, "<h2>Suspicion Breeds Confidence</h2>", "<p>Always report suspicious activity to local law enforcement.</p>"
      ],
      title: "Citizen Watch Program"
    };

    ReferralPage.prototype.initialize = function() {
      var _this = this;
      this.$linkReload().click(function() {
        return _this.$suspectList().reload();
      });
      return this.$linkAbstain().click(function() {
        return alert("You gain karma by not cooperating.");
      });
    };

    return ReferralPage;

  })(DupPage);

  window.RegisterPage = (function(_super) {

    __extends(RegisterPage, _super);

    function RegisterPage() {
      return RegisterPage.__super__.constructor.apply(this, arguments);
    }

    RegisterPage.prototype.inherited = {
      content: [
        "<p>Thank you for agreeing to participate in compulsory citizen registration.</p>\n<h2>Complete Your Citizen Registration Profile</h2>\n<p>\nYour responses may be verified against information we have obtained from\nother, confidential sources. If you believe those sources are in error,\nyou have the right to file an appeal and appear before a Department of\nUnified Protection information verification tribunal.\n</p>", "<div class='label'>Your name:</div>", {
          control: "FieldWithNotice",
          ref: "fieldName",
          notice: "This name does not match our records.",
          content: [
            {
              control: ValidatingTextBox,
              ref: "name",
              generic: false,
              required: true
            }
          ]
        }, {
          html: "div",
          content: [
            "<div class='label'>Social Security Number:</div>", {
              control: TextBox,
              content: "[On File]",
              disabled: true
            }
          ]
        }, "<div class='label'>Date of birth:</div>", {
          control: "FieldWithNotice",
          ref: "fieldBirthday",
          notice: "This date does not match our records.",
          content: [
            {
              html: "div",
              ref: "dateContainer",
              content: {
                control: DateComboBox,
                ref: "birthday"
              }
            }
          ]
        }, {
          html: "div",
          content: [
            "<div class='label'>Primary residence address where we can find you:</div>", {
              html: "<textarea>",
              ref: "address"
            }
          ]
        }, {
          html: "div",
          content: [
            "<div class='label'>Preferred email address if we have questions:</div>", {
              control: ValidatingTextBox,
              ref: "email",
              generic: false,
              required: true
            }
          ]
        }, {
          html: "div",
          content: [
            "<div class='label'>Do you believe you have paranormal abilities?</div>", {
              control: RadioButton,
              content: "Yes",
              name: "haveParanormal"
            }, {
              control: RadioButton,
              content: "No",
              name: "haveParanormal"
            }
          ]
        }, {
          html: "div",
          content: [
            "<div class='label'>Have you witnessed individuals with paranormal abilities?</div>", {
              control: RadioButton,
              content: "Yes",
              name: "witnessedParanormal"
            }, {
              control: RadioButton,
              content: "No",
              name: "witnessedParanormal"
            }
          ]
        }, {
          control: "Notice",
          content: "All fields are required.",
          ref: "requiredNotice",
          toggle: false
        }, {
          html: "p",
          content: [
            {
              control: BasicButton,
              ref: "submitButton",
              content: "Submit",
              disabled: true
            }
          ]
        }
      ],
      title: "Compulsory Citizen Registation"
    };

    RegisterPage.prototype.address = Control.chain("$address", "content");

    RegisterPage.prototype.birthday = Control.chain("$birthday", "date");

    RegisterPage.prototype.currentUser = Control.property(function() {
      return this.$submitButton().disabled(false);
    });

    RegisterPage.prototype.email = Control.chain("$email", "content");

    RegisterPage.prototype.haveParanormal = function() {
      return this._yesNoGroupValue("haveParanormal");
    };

    RegisterPage.prototype.initialize = function() {
      var _this = this;
      this.birthday(null);
      Facebook.currentUser(function(user) {
        return _this.currentUser(user);
      });
      return this.$submitButton().click(function(event) {
        var valid;
        valid = event.ctrlKey || _this.valid();
        if (valid) {
          Cookie.set("address", _this.address());
          return _this.navigateWithAccessToken("referral.html");
        }
      });
    };

    RegisterPage.prototype.name = Control.chain("$name", "content");

    RegisterPage.prototype.requiredFieldsComplete = function() {
      return this.$name().valid() && (this.birthday() != null) && this.address().length > 0 && this.$email().valid() && (this.haveParanormal() != null) && (this.witnessedParanormal() != null);
    };

    RegisterPage.prototype.valid = function() {
      var requiredFieldsComplete, validBirthday, validName;
      requiredFieldsComplete = this.requiredFieldsComplete();
      this.$requiredNotice().toggle(!requiredFieldsComplete);
      if (!requiredFieldsComplete) {
        return;
      }
      validName = this.validName();
      this.$fieldName().toggleNotice(!validName);
      validBirthday = this.validBirthday();
      this.$fieldBirthday().toggleNotice(!validBirthday);
      return validName && validBirthday;
    };

    RegisterPage.prototype.validBirthday = function() {
      var birthday, fbBirthday;
      birthday = this.birthday();
      fbBirthday = new Date(Date.parse(this.currentUser().birthday));
      return birthday.getFullYear() === fbBirthday.getFullYear() && birthday.getMonth() === fbBirthday.getMonth() && birthday.getDate() === fbBirthday.getDate();
    };

    RegisterPage.prototype.validName = function() {
      return this.name() === this.currentUser().name;
    };

    RegisterPage.prototype.witnessedParanormal = function() {
      return this._yesNoGroupValue("witnessedParanormal");
    };

    RegisterPage.prototype._radioGroupValue = function(groupName) {
      var checked, _ref, _ref1;
      checked = $("input[name=" + groupName + "]:checked");
      if (checked.length === 0) {
        return null;
      }
      return (_ref = checked.parent()) != null ? (_ref1 = _ref.control()) != null ? _ref1.content() : void 0 : void 0;
    };

    RegisterPage.prototype._yesNoGroupValue = function(groupName) {
      switch (this._radioGroupValue(groupName)) {
        case "Yes":
          return true;
        case "No":
          return false;
        default:
          return null;
      }
    };

    return RegisterPage;

  })(DupPage);

  window.SuspectList = (function(_super) {

    __extends(SuspectList, _super);

    function SuspectList() {
      return SuspectList.__super__.constructor.apply(this, arguments);
    }

    SuspectList.prototype.inherited = {
      content: [
        {
          html: "<img src='resources/progressIndicator.gif'/>",
          ref: "progressIndicator"
        }, {
          control: List,
          ref: "list",
          itemClass: "SuspectTile",
          mapFunction: "suspect"
        }
      ]
    };

    SuspectList.prototype.friends = Control.property();

    SuspectList.prototype.initialize = function() {
      var _this = this;
      return Facebook.currentUser(function(data) {
        return Facebook.currentUserFriends(function(friends) {
          _this.friends(friends);
          return _this.reload();
        });
      });
    };

    SuspectList.prototype.reload = function() {
      var friend, friendIndex, friends, shuffled, suspects,
        _this = this;
      this._loaded(false);
      friends = this.friends();
      suspects = Suspects.select(3, friends);
      friendIndex = Math.floor(Math.random() * friends.length);
      friend = friends[friendIndex];
      suspects.push({
        isFriend: true,
        name: friend.name,
        picture: Facebook.pictureUrlForUser(friend)
      });
      shuffled = Utilities.shuffle(suspects);
      this.$list().items(shuffled);
      return setTimeout((function() {
        return _this._loaded(true);
      }), 1000);
    };

    SuspectList.prototype._loaded = Control.property(function(loaded) {
      this.$progressIndicator().toggle(!loaded);
      return this.$list().css("visibility", loaded ? "inherit" : "hidden");
    });

    return SuspectList;

  })(Control);

  /*
  Deals with selecting random "suspects".
  
  TODO: Simplify. This originally assumed a suspect's name would be shown, but
  now it's just a picture. So all the names and gender stuff can go away.
  */


  window.Suspects = (function() {

    function Suspects() {}

    Suspects.select = function(count, friends) {
      var friendHasName, picture, picturesFemale, picturesMale, selected, suspect, suspects, _i, _len;
      selected = [];
      suspects = Utilities.shuffle(Suspects._suspects);
      picturesFemale = Utilities.shuffle(Suspects._picturesFemale);
      picturesMale = Utilities.shuffle(Suspects._picturesMale);
      for (_i = 0, _len = suspects.length; _i < _len; _i++) {
        suspect = suspects[_i];
        friendHasName = (Suspects._friendWithName(suspect.name, friends)) != null;
        if (!friendHasName) {
          picture = suspect.gender === "male" ? picturesMale.shift() : picturesFemale.shift();
          selected.push({
            name: suspect.name,
            picture: picture
          });
          if (selected.length >= count) {
            return selected;
          }
        }
      }
      return selected;
    };

    Suspects._friendWithName = function(name, friends) {
      var friend, _i, _len;
      for (_i = 0, _len = friends.length; _i < _len; _i++) {
        friend = friends[_i];
        if (friend.name === name) {
          return friend;
        }
      }
      return null;
    };

    Suspects._picturesFemale = ["resources/pictures/female1.jpg", "resources/pictures/female2.jpg", "resources/pictures/female3.jpg", "resources/pictures/female4.jpg", "resources/pictures/female5.jpg", "resources/pictures/female6.jpg", "resources/pictures/female7.jpg", "resources/pictures/female8.jpg", "resources/pictures/female9.jpg", "resources/pictures/female10.jpg"];

    Suspects._picturesMale = ["resources/pictures/male1.jpg", "resources/pictures/male2.jpg", "resources/pictures/male3.jpg", "resources/pictures/male4.jpg", "resources/pictures/male5.jpg", "resources/pictures/male6.jpg", "resources/pictures/male7.jpg", "resources/pictures/male8.jpg", "resources/pictures/male9.jpg", "resources/pictures/male10.jpg"];

    Suspects._suspects = [
      {
        name: "Adolphus Lueilwitz",
        gender: "male"
      }, {
        name: "Alene O'Keefe",
        gender: "female"
      }, {
        name: "Allan Labadie",
        gender: "male"
      }, {
        name: "Alvena D'Amore",
        gender: "female"
      }, {
        name: "Antonette Klein",
        gender: "female"
      }, {
        name: "Ara Stracke",
        gender: "female"
      }, {
        name: "Arlene Altenwerth",
        gender: "female"
      }, {
        name: "Bethel Weimann",
        gender: "female"
      }, {
        name: "Brendon Hoppe",
        gender: "male"
      }, {
        name: "Brenna Schulist",
        gender: "female"
      }, {
        name: "Brent Mueller",
        gender: "male"
      }, {
        name: "Brigitte Hudson",
        gender: "female"
      }, {
        name: "Casey Mayer",
        gender: "female"
      }, {
        name: "Cassandre Langosh",
        gender: "female"
      }, {
        name: "Clara Cruickshank",
        gender: "female"
      }, {
        name: "Claudine Mraz",
        gender: "female"
      }, {
        name: "Cleora Carter",
        gender: "female"
      }, {
        name: "Connie Padberg",
        gender: "female"
      }, {
        name: "Connie Schamberger",
        gender: "female"
      }, {
        name: "Cornelius Beer",
        gender: "male"
      }, {
        name: "Dalton Klocko",
        gender: "male"
      }, {
        name: "Daren Nicolas",
        gender: "male"
      }, {
        name: "Dedrick Hammes",
        gender: "male"
      }, {
        name: "Dejon Kilback",
        gender: "male"
      }, {
        name: "Della McCullough",
        gender: "female"
      }, {
        name: "Delmer Prosacco",
        gender: "male"
      }, {
        name: "Derrick Wiza",
        gender: "male"
      }, {
        name: "Deshaun Smitham",
        gender: "male"
      }, {
        name: "Desmond Hermiston",
        gender: "male"
      }, {
        name: "Donnell Robel",
        gender: "male"
      }, {
        name: "Dorian Kautzer",
        gender: "female"
      }, {
        name: "Eden Effertz",
        gender: "female"
      }, {
        name: "Eleazar Huels",
        gender: "female"
      }, {
        name: "Eloisa Dicki",
        gender: "female"
      }, {
        name: "Elton Reinger",
        gender: "male"
      }, {
        name: "Emanuel Prosacco",
        gender: "male"
      }, {
        name: "Emilie Parisian",
        gender: "female"
      }, {
        name: "Ephraim Bosco",
        gender: "male"
      }, {
        name: "Faye Vandervort",
        gender: "female"
      }, {
        name: "Felipe Borer",
        gender: "male"
      }, {
        name: "Fermin Daniel",
        gender: "male"
      }, {
        name: "Floy Block",
        gender: "male"
      }, {
        name: "Freda Breitenberg",
        gender: "female"
      }, {
        name: "Garnett Green",
        gender: "male"
      }, {
        name: "Gaylord Littel",
        gender: "male"
      }, {
        name: "Grant Kessler",
        gender: "male"
      }, {
        name: "Guadalupe Borer",
        gender: "male"
      }, {
        name: "Hailee Stiedemann",
        gender: "female"
      }, {
        name: "Haylie Hammes",
        gender: "female"
      }, {
        name: "Isac Bayer",
        gender: "male"
      }, {
        name: "Ivah Hermiston",
        gender: "female"
      }, {
        name: "Jakayla Koepp",
        gender: "female"
      }, {
        name: "Jaquelin Volkman",
        gender: "female"
      }, {
        name: "Jarrett Schneider",
        gender: "male"
      }, {
        name: "Johanna Harris",
        gender: "female"
      }, {
        name: "Keith Hickle",
        gender: "male"
      }, {
        name: "Koby Morissette",
        gender: "male"
      }, {
        name: "Kurt Hahn",
        gender: "male"
      }, {
        name: "Lacey Shields",
        gender: "female"
      }, {
        name: "Lacy Ernser",
        gender: "female"
      }, {
        name: "Landen Padberg",
        gender: "male"
      }, {
        name: "Layne Ferry",
        gender: "male"
      }, {
        name: "Lou Kilback",
        gender: "male"
      }, {
        name: "Lurline Hudson",
        gender: "female"
      }, {
        name: "Luz Funk",
        gender: "female"
      }, {
        name: "Madison Welch",
        gender: "female"
      }, {
        name: "Maria Rath",
        gender: "female"
      }, {
        name: "Marianne Bahringer",
        gender: "female"
      }, {
        name: "Maudie Gerlach",
        gender: "female"
      }, {
        name: "Mavis Adams",
        gender: "female"
      }, {
        name: "Maybell Mraz",
        gender: "female"
      }, {
        name: "Megane Reichel",
        gender: "female"
      }, {
        name: "Milford Emard",
        gender: "male"
      }, {
        name: "Mona D'Amore",
        gender: "female"
      }, {
        name: "Monte Stark",
        gender: "male"
      }, {
        name: "Nicklaus Stark",
        gender: "male"
      }, {
        name: "Nicole Hagenes",
        gender: "female"
      }, {
        name: "Noble Simonis",
        gender: "female"
      }, {
        name: "Norbert Padberg",
        gender: "male"
      }, {
        name: "Norene Harber",
        gender: "female"
      }, {
        name: "Octavia Yundt",
        gender: "female"
      }, {
        name: "Onie Altenwerth",
        gender: "male"
      }, {
        name: "Oscar Stroman",
        gender: "male"
      }, {
        name: "Prince Hermiston",
        gender: "male"
      }, {
        name: "Retha Schuster",
        gender: "female"
      }, {
        name: "Sally Swaniawski",
        gender: "female"
      }, {
        name: "Santina Carroll",
        gender: "female"
      }, {
        name: "Sarah Ratke",
        gender: "female"
      }, {
        name: "Shania Grant",
        gender: "female"
      }, {
        name: "Simone Volkman",
        gender: "female"
      }, {
        name: "Sydney Dickens",
        gender: "male"
      }, {
        name: "Tia Stehr",
        gender: "female"
      }, {
        name: "Tina Schneider",
        gender: "female"
      }, {
        name: "Trevion Fisher",
        gender: "male"
      }, {
        name: "Velva Rempel",
        gender: "female"
      }, {
        name: "Waino Halvorson",
        gender: "male"
      }, {
        name: "Willard Ritchie",
        gender: "male"
      }, {
        name: "Yvette Zulauf",
        gender: "female"
      }, {
        name: "Zachariah Johns",
        gender: "male"
      }, {
        name: "Zita Dach",
        gender: "female"
      }
    ];

    return Suspects;

  })();

  window.SuspectTile = (function(_super) {

    __extends(SuspectTile, _super);

    function SuspectTile() {
      return SuspectTile.__super__.constructor.apply(this, arguments);
    }

    SuspectTile.prototype.inherited = {
      content: [
        {
          html: "div",
          ref: "container",
          content: [
            {
              html: "img",
              ref: "picture"
            }, {
              html: "div",
              ref: "identifier"
            }, {
              html: "div",
              ref: "timestamp"
            }
          ]
        }
      ]
    };

    SuspectTile.prototype.identifier = Control.chain("$identifier", "content");

    SuspectTile.prototype.initialize = function() {
      var _this = this;
      return this.click(function() {
        if (_this.suspect().isFriend) {
          return alert("You lose karma because you implicated a friend.");
        } else {
          return alert("You lose karma because you implicated an innocent stranger.");
        }
      });
    };

    SuspectTile.prototype.picture = Control.chain("$picture", "prop/src");

    SuspectTile.prototype.suspect = Control.property(function(suspect) {
      this._populateRandomFields();
      return this.picture(suspect.picture);
    });

    SuspectTile.prototype.timestamp = Control.chain("$timestamp", "content");

    SuspectTile.prototype._populateRandomFields = function() {
      var d, date, h, identifier, m, s, timestamp, y;
      identifier = Math.random() * 100000000000;
      identifier = identifier.toString().replace(".", "-");
      this.identifier(identifier);
      date = new Date();
      date.setDate(date.getDate() - Math.random() * 365);
      date.setMinutes(date.getMinutes() - Math.random() * 24 * 60);
      y = date.getFullYear();
      m = this._padZero(date.getMonth() + 1);
      d = this._padZero(date.getDate());
      h = this._padZero(date.getHours());
      m = this._padZero(date.getMinutes());
      s = this._padZero(date.getSeconds());
      timestamp = "" + y + "-" + m + "-" + d + " " + h + ":" + m + ":" + s;
      return this.timestamp(timestamp);
    };

    SuspectTile.prototype._padZero = function(n) {
      return ("0" + n).substr(-2, 2);
    };

    return SuspectTile;

  })(Control);

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
          ref: "map"
        }, {
          html: "div",
          ref: "caption"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs1",
          "class": "crosshairs"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs2",
          "class": "crosshairs"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs3",
          "class": "crosshairs"
        }, {
          html: "<img src='resources/crosshairs.png'/>",
          ref: "crosshairs4",
          "class": "crosshairs"
        }
      ]
    };

    SatellitePhoto.prototype.initialize = function() {
      this.$caption().content("DUP Panopticon satellite capture<br/>\n" + (new Date()));
      this.$map().mapTypeId(google.maps.MapTypeId.SATELLITE);
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

  window.Log = (function(_super) {

    __extends(Log, _super);

    function Log() {
      return Log.__super__.constructor.apply(this, arguments);
    }

    Log.prototype.clear = function() {
      return this.content("");
    };

    Log.prototype.tag = "pre";

    Log.prototype.write = function(s) {
      var content;
      content = this.content();
      if (content.length === 0) {
        content = "";
      }
      return this.content(content + s);
    };

    Log.prototype.writeln = function(s) {
      s = s != null ? s : "";
      return this.write(s + "\n");
    };

    return Log;

  })(Control);

  window.Terminal = (function(_super) {

    __extends(Terminal, _super);

    function Terminal() {
      return Terminal.__super__.constructor.apply(this, arguments);
    }

    Terminal.prototype.inherited = {
      content: [
        {
          control: "Log",
          ref: "log"
        }, {
          control: "HorizontalPanels",
          left: {
            html: "pre",
            ref: "prompt"
          },
          content: {
            html: "<input type='text' spellcheck='false'/>",
            ref: "userInput"
          }
        }
      ]
    };

    Terminal.prototype.clear = Control.chain("$log", "clear");

    Terminal.prototype.focusOnUserInput = function() {
      return this.$userInput().focus();
    };

    Terminal.prototype.initialize = function() {
      var _this = this;
      this.click(function() {
        return _this.focusOnUserInput();
      });
      this.$userInput().keydown(function(event) {
        if (event.which === 13) {
          return _this._handleInput();
        }
      });
      return this.inDocument(function() {
        return this.focusOnUserInput();
      });
    };

    Terminal.prototype.prompt = Control.chain("$prompt", "content");

    Terminal.prototype.readln = function(callback) {
      this.prompt(env.prompt);
      this.focusOnUserInput();
      this.scrollToUserInput();
      return this._readlnCallbacks().push(callback);
    };

    Terminal.prototype.scrollToUserInput = function() {
      var $document, $userInput, userInputBottom, windowHeight;
      $document = $(document);
      $userInput = this.$userInput();
      userInputBottom = $userInput.offset().top + $userInput.height();
      windowHeight = $(window).height();
      if (userInputBottom > $document.scrollTop() + windowHeight) {
        return $document.scrollTop($document.height() - windowHeight);
      }
    };

    Terminal.prototype.userInput = Control.chain("$userInput", "content");

    Terminal.prototype.write = Control.chain("$log", "write");

    Terminal.prototype.writeln = Control.chain("$log", "writeln");

    Terminal.prototype._readlnCallbacks = Control.property(null, []);

    Terminal.prototype._handleInput = function() {
      var callback, input;
      input = this.userInput();
      this.write(this.prompt());
      this.writeln(input);
      this.userInput("");
      callback = this._readlnCallbacks().shift();
      if (callback != null) {
        return callback.call(this, input);
      }
    };

    return Terminal;

  })(Control);

  window.TerminalPage = (function(_super) {

    __extends(TerminalPage, _super);

    function TerminalPage() {
      return TerminalPage.__super__.constructor.apply(this, arguments);
    }

    TerminalPage.prototype.inherited = {
      title: "Copper Terminal",
      content: [
        {
          control: Terminal,
          ref: "terminal"
        }
      ]
    };

    TerminalPage.prototype.initialize = function() {
      var userName;
      userName = Page.urlParameters().user;
      return login(userName);
    };

    TerminalPage.prototype.clear = Control.chain("$terminal", "clear");

    TerminalPage.prototype.prompt = Control.chain("$terminal", "prompt");

    TerminalPage.prototype.readln = Control.chain("$terminal", "readln");

    TerminalPage.prototype.terminal = Control.chain("$terminal", "control");

    TerminalPage.prototype.write = Control.chain("terminal", "write");

    TerminalPage.prototype.writeln = Control.chain("terminal", "writeln");

    return TerminalPage;

  })(Page);

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

  window.AccountPage = (function(_super) {

    __extends(AccountPage, _super);

    function AccountPage() {
      return AccountPage.__super__.constructor.apply(this, arguments);
    }

    AccountPage.prototype.inherited = {
      content: [
        "<div>Enter your address in any Google Maps-friendly format (e.g.: \"123 Main St., Anytown, NY\"):</div>", {
          control: "TextBoxWithButton2",
          ref: "address"
        }
      ]
    };

    AccountPage.prototype.address = Control.chain("$address", "content");

    AccountPage.prototype.initialize = function() {
      var _this = this;
      this.$address().find("input").focus();
      return this.$address().on("goButtonClick", function() {
        return window.location = "satellite?address=" + (_this.address());
      });
    };

    return AccountPage;

  })(DupPage);

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
      coverPhoto: "resources/coverPhoto.jpg",
      employer: "Microsoft Corporation",
      employerPage: "http://www.facebook.com/Microsoft",
      major: "English",
      name: "Ann Williams",
      position: "Project Manager",
      profilePhoto: "resources/profilePhoto.jpg"
    };

    HeroinePage.prototype.initialize = function() {
      var content, control, date, post, posts,
        _this = this;
      this.on("click", ".satelliteSample", function() {
        return window.location = "../satellite";
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
            html: "<img class='satelliteSample' src='resources/satelliteSample.png'/>"
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

// Generated by CoffeeScript 1.3.3

/*
Handles formatting arrays of text into columns a la "ls" command output.
*/


(function() {
  var File,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  window.columns = {
    bestColumnWidths: function(lengths) {
      var columnCount, lineLength, widths, _i, _ref;
      for (columnCount = _i = _ref = lengths.length; _ref <= 1 ? _i <= 1 : _i >= 1; columnCount = _ref <= 1 ? ++_i : --_i) {
        widths = columns.columnWidths(lengths, columnCount);
        lineLength = columns.lineLength(widths);
        if (lineLength <= columns.maxLineLength) {
          return widths;
        }
      }
      return widths;
    },
    columnSpacing: 2,
    columnWidths: function(lengths, columnCount) {
      var column, i, widths, _i, _ref;
      widths = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 1; 1 <= columnCount ? _i <= columnCount : _i >= columnCount; i = 1 <= columnCount ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      })();
      for (i = _i = 0, _ref = lengths.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        column = i % columnCount;
        widths[column] = Math.max(widths[column], lengths[i]);
      }
      return widths;
    },
    format: function(strings) {
      var columnWidths, lengths, s;
      lengths = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = strings.length; _i < _len; _i++) {
          s = strings[_i];
          _results.push(s.length);
        }
        return _results;
      })();
      columnWidths = columns.bestColumnWidths(lengths);
      return columns.formatColumns(strings, columnWidths);
    },
    formatColumns: function(strings, columnWidths) {
      var column, columnCount, i, margin, padded, result, s, stringCount, _i, _len;
      columnCount = columnWidths.length;
      stringCount = strings.length;
      margin = columns.repeat(" ", columns.columnSpacing);
      result = "";
      for (i = _i = 0, _len = strings.length; _i < _len; i = ++_i) {
        s = strings[i];
        column = i % columnCount;
        padded = columns.pad(s, columnWidths[column]);
        result += padded;
        if (column < columnCount - 1) {
          result += margin;
        } else if (i < stringCount - 1) {
          result += "\n";
        }
      }
      return result;
    },
    lineLength: function(widths) {
      var length, width, _i, _len;
      length = 0;
      for (_i = 0, _len = widths.length; _i < _len; _i++) {
        width = widths[_i];
        length += width;
      }
      length += (widths.length - 1) * columns.columnSpacing;
      return length;
    },
    maxLineLength: 78,
    pad: function(s, length) {
      var spaces;
      spaces = columns.repeat(" ", length - s.length);
      return s + spaces;
    },
    repeat: function(s, count) {
      return (new Array(count + 1)).join(s);
    }
  };

  window.commands = {};

  window.env = {
    currentDirectory: null,
    prompt: null,
    readme: "Agents who have not yet completed compulsory training should enter \"help\" at\nthe console prompt.\n",
    setUser: function(userName) {
      var homeDirectory, homePath, readme, _ref;
      if (fs.root == null) {
        fs.root = new Directory("/", null, files);
      }
      env.userName = userName;
      homePath = fs.join("/usr", userName);
      homeDirectory = fs.root.getDirectoryWithPath(homePath);
      env.homeDirectory = homeDirectory != null ? homeDirectory : fs.root;
      if (((_ref = env.homeDirectory.contents) != null ? _ref.length : void 0) === 0) {
        readme = new TextFile("readme", null, env.readme);
        env.homeDirectory.addFile(readme);
      }
      return env.currentDirectory = env.homeDirectory;
    },
    userName: null
  };

  File = (function() {

    function File(name, parent, contents) {
      this.name = name;
      this.parent = parent;
      this.contents = contents;
    }

    return File;

  })();

  /*
  File system
  */


  window.files = {
    bin: {},
    etc: {},
    usr: {
      adrianb: {},
      andrewk: {},
      andreww: {},
      andym: {},
      andyx: {},
      billro: {},
      billyh: {},
      bradm: {},
      brentt: {},
      brianf: {},
      bruceo: {},
      chrishe: {},
      christopherb: {},
      chrisz: {},
      dannyw: {},
      darrenb: {},
      davem: {},
      davidm: {},
      dongjoonl: {},
      edwardp: {},
      emiliog: {},
      gailo: {},
      gregt: {},
      haroldl: {},
      horiad: {},
      isaiahs: {},
      jaimeg: {},
      jamesm: {},
      jancea: {},
      janm: {
        foo: "Foo\n",
        bar: "Bar\n",
        google: "http://google.com",
        maze: "-> /usr/danaa"
      },
      jasminp: {},
      jasonc: {},
      jasons: {},
      jefff: {},
      jeffl: {},
      jeffm: {},
      joannaw: {},
      johng: {},
      johnh: {},
      joshj: {},
      joshr: {},
      kens: {},
      leae: {},
      liannec: {},
      lukes: {},
      mattd: {},
      mattl: {},
      mattv: {},
      maxc: {},
      mdhaynes: {},
      michaelm: {},
      mikeg: {},
      mikeh: {},
      morganh: {},
      natef: {},
      nathanr: {},
      parkerh: {},
      philo: {},
      rameyh: {},
      ranjith: {},
      rickb: {},
      rickl: {},
      romanm: {},
      scottw: {},
      seans: {},
      shahbaaz: {},
      shannonl: {},
      sofiew: {},
      soniaj: {},
      sooyunj: {},
      spencera: {},
      stephenw: {},
      stevei: {},
      susanl: {},
      tedf: {},
      teresab: {},
      tobyt: {},
      tomm: {},
      tyk: {},
      willh: {},
      williamr: {}
    }
  };

  /*
  Maze puzzle in Dana's folder.
  */


  window.files.usr.danaa = {
    plans: {
      round1: {
        copy: "-> /usr/danaa/plans-review/copy"
      },
      round2: {
        plans2: "-> /usr/danaa/plans2"
      }
    },
    plans2: {
      plans: "-> /usr/danaa/plans",
      review: "-> /usr/danaa/plans-review/plans"
    },
    "plans-review": {
      copy: {
        latest: "-> /usr/danaa/plans/round2"
      },
      plans: {
        "final": "-> /usr/danaa/plans-review/plans-final-FINAL"
      },
      "plans-final": {
        "for-review": "-> /usr/danaa/plans/round2"
      },
      "plans.copy": {
        round1: {
          plans: "-> /usr/danaa/plans/round1",
          round2: {
            secret: "Congratulations, you have found the super-secret file!\n"
          }
        },
        original: "-> /usr/danaa/plans2/plans"
      },
      "plans-final-FINAL": "-> /usr/danaa/plans-review/plans-final"
    },
    readme: "Ugh, where the hell is the final plan?\nWhen I find the idiot who created these files, I'm going to make sure they\ndie a slow death.\n-D\n"
  };

  window.fs = {
    exists: function(path) {
      return fs.root.exists(path);
    },
    join: function(path1, path2) {
      return fs.normalize(path1 + fs.separator + path2);
    },
    normalize: function(path) {
      var part, parts, _i, _len, _ref;
      parts = [];
      _ref = path.split(fs.separator);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        part = _ref[_i];
        switch (part) {
          case "":
            break;
          case "..":
            parts.pop();
            break;
          default:
            parts.push(part);
        }
      }
      return fs.separator + parts.join(fs.separator);
    },
    root: null,
    separator: "/"
  };

  window.login = function(userName) {
    terminal.clear();
    window.stdout = terminal;
    stdout.writeln(login.welcome);
    env.prompt = "login: ";
    if (userName != null) {
      return login._startShellForUser(userName);
    } else {
      return terminal.readln(function(userName) {
        if ((userName != null ? userName.length : void 0) > 0) {
          env.prompt = "password: ";
          return terminal.readln(function(password) {
            return login._startShellForUser(userName);
          });
        } else {
          return login();
        }
      });
    }
  };

  login._startShellForUser = function(userName) {
    stdout.writeln("" + userName + " logged in");
    stdout.writeln("" + (new Date()));
    stdout.writeln(login.motd);
    env.setUser(userName);
    return commands.sh();
  };

  login.welcome = "DUPos/X 12.0d\nWelcome to the D.U.P. agent console\n\nThis server is for use only by authorized Department of Unified Protection\nagents. Use of this service constitutes acceptance of our security policies.\nIf you do not agree to or understand these policies, or are not an authorized\nagent, you must disconnect immediately.\n";

  login.motd = "Enter \"help\" for a list of commands.";

  window.logout = function() {
    env.userName = null;
    env.homeDirectory = null;
    return login();
  };

  window.SymbolicLink = (function(_super) {

    __extends(SymbolicLink, _super);

    function SymbolicLink() {
      return SymbolicLink.__super__.constructor.apply(this, arguments);
    }

    SymbolicLink.prototype.destination = function() {
      return fs.root.getFileWithPath(this.contents);
    };

    return SymbolicLink;

  })(File);

  /*
  Link the terminal to the topmost page.
  */


  window.terminal = {
    clear: function() {
      return this.page().clear();
    },
    readln: function(callback) {
      return this.page().readln(callback);
    },
    page: function() {
      return $("body").control();
    },
    prompt: function(s) {
      return this.page().prompt(s);
    },
    write: function(s) {
      return this.page().write(s);
    },
    writeln: function(s) {
      return this.page().writeln(s);
    }
  };

  window.TextFile = (function(_super) {

    __extends(TextFile, _super);

    function TextFile(name, parent, contents) {
      this.name = name;
      this.parent = parent;
      this.contents = contents;
      TextFile.__super__.constructor.call(this, this.name, this.parent, this.contents);
      if (!(this.contents != null)) {
        this.contents = "";
      }
    }

    TextFile.prototype.write = function(s) {
      return this.contents += s;
    };

    TextFile.prototype.writeln = function(s) {
      return this.write(s + "\n");
    };

    return TextFile;

  })(File);

  commands.cat = function() {
    var arg, args, file, _i, _len;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      file = env.currentDirectory.getFileWithPath(arg);
      if (file == null) {
        stdout.writeln("cat: " + arg + ": No such file or directory");
        return;
      }
      if (file instanceof Directory) {
        stdout.writeln("cat: " + arg + ": Is a directory");
        return;
      }
      if (file.contents != null) {
        stdout.write(file.contents);
      }
    }
  };

  commands.cd = function(arg) {
    var directory;
    if ((arg != null ? arg.substr(0, 1) : void 0) === fs.separator) {
      stdout.writeln("cd: Absolute addressing disabled due to exigent circumstances.");
      return;
    }
    directory = arg != null ? env.currentDirectory.getDirectoryWithPath(arg) : env.homeDirectory;
    if (directory) {
      env.currentDirectory = directory;
      return stdout.writeln(env.currentDirectory.path());
    } else {
      return stdout.writeln("cd: " + arg + ": No such file or directory");
    }
  };

  commands.civstat = function() {};

  commands.clear = function() {
    return terminal.clear();
  };

  commands.debug = function() {
    debugger;
  };

  commands.echo = function() {
    var args, message;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    message = args.join(" ");
    return stdout.writeln(message);
  };

  commands.help = function() {
    return stdout.writeln(commands.help.message);
  };

  commands.help.message = "\nAvailable commands:\n\ncat [filename]      Display the contents of file(s)\ncd [directoryname]  Change directory. Enter \"cd ..\" to go up one level.\nclear               Clear the terminal console\necho [arguments]    Echo arguments\nhelp                Display this message\nlogout              Log out\nls                  List directory contents\npwd                 Display the name of the current directory\nwhoami              show the name of the current user\n";

  commands.ls = function(arg) {
    var child, file, fileNames, output;
    if (arg != null) {
      file = env.currentDirectory.getFileWithPath(arg);
      if (file == null) {
        stdout.writeln("ls: " + arg + ": No such file or directory");
        return;
      }
    } else {
      file = env.currentDirectory;
    }
    if (file instanceof Directory) {
      fileNames = (function() {
        var _i, _len, _ref, _results;
        _ref = file.contents;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.name);
        }
        return _results;
      })();
      fileNames.sort();
      output = columns.format(fileNames);
      if (output.length > 0) {
        return stdout.writeln(output);
      }
    } else {
      return stdout.writeln(file.name);
    }
  };

  commands.open = function() {
    var arg, args, file, _i, _len;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      file = env.currentDirectory.getFileWithPath(arg);
      if (file == null) {
        stdout.writeln("open: " + arg + ": No such file or directory");
        return;
      }
      if (file instanceof Directory) {
        stdout.writeln("open: " + arg + ": Is a directory");
        return;
      }
      if (file.contents != null) {
        window.open(file.contents);
      }
    }
  };

  commands.pwd = function() {
    return stdout.writeln(env.currentDirectory.path());
  };

  commands.sh = function() {
    if (!env.currentDirectory) {
      env.currentDirectory = "/";
    }
    env.prompt = "$ ";
    window.stdout = terminal;
    return terminal.readln(function(s) {
      var args, command, commandFn, existingFile, outputFile, redirect, _ref;
      switch (s) {
        case "":
          break;
        case "exit":
        case "logout":
          logout();
          return;
        default:
          _ref = commands.sh.parse(s), command = _ref.command, args = _ref.args, redirect = _ref.redirect;
          commandFn = commands[command];
          if (commandFn != null) {
            if (redirect != null) {
              existingFile = env.currentDirectory.getFileWithName(redirect);
              if (existingFile != null) {
                outputFile = existingFile;
              } else {
                outputFile = new TextFile(redirect, env.currentDirectory);
                env.currentDirectory.contents.push(outputFile);
              }
              window.stdout = outputFile;
            }
            commandFn.apply(null, args);
          } else {
            stdout.writeln("" + commandName + ": command not found");
          }
      }
      return commands.sh();
    });
  };

  commands.sh.parse = function(s) {
    var args, command, main, parts, redirect, _ref;
    parts = s.split(">");
    main = parts[0];
    redirect = (_ref = parts[1]) != null ? _ref.trim() : void 0;
    args = main.split(" ");
    command = args.shift();
    return {
      command: command,
      args: args,
      redirect: redirect
    };
  };

  commands.sum = function() {
    var arg, args, file, result, _i, _len;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (args.length === 0) {
      stdout.writeln("usage: sum [files...]");
      return;
    }
    result = 0;
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      file = env.currentDirectory.getFileWithPath(arg);
      if (file == null) {
        stdout.writeln("sum: " + arg + ": No such file or directory");
        return;
      }
      result += commands.sum.sumFile(file);
    }
    return stdout.writeln(result);
  };

  commands.sum.sumDirectory = function(directory) {
    var file, result, _i, _len, _ref;
    result = 0;
    _ref = directory.contents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      result += commands.sum.sumFile(file);
    }
    return result;
  };

  commands.sum.sumFile = function(file) {
    if (file instanceof Directory) {
      return commands.sum.sumDirectory(file);
    } else if (file instanceof TextFile) {
      return commands.sum.sumString(file.contents);
    } else {
      return 0;
    }
  };

  commands.sum.sumString = function(string) {
    return string.length;
  };

  commands.whoami = function() {
    return stdout.writeln(env.userName);
  };

  commands.xyzzy = function() {
    return stdout.writeln("Nothing happens");
  };

  window.Directory = (function(_super) {

    __extends(Directory, _super);

    Directory.prototype.addFile = function(file) {
      file.parent = this;
      return this.contents.push(file);
    };

    function Directory(name, parent, fileData) {
      var data;
      this.name = name;
      this.parent = parent;
      this.contents = (function() {
        var _results;
        _results = [];
        for (name in fileData) {
          data = fileData[name];
          _results.push(this._dataToFile(name, data));
        }
        return _results;
      }).call(this);
    }

    Directory.prototype.exists = function(path) {
      return (this.getFileWithPath(path)) != null;
    };

    Directory.prototype.getDirectoryWithPath = function(path) {
      var file;
      file = this.getFileWithPath(path);
      if (file instanceof Directory) {
        return file;
      } else {
        return null;
      }
    };

    Directory.prototype.getFileWithName = function(name) {
      var file, _i, _len, _ref;
      _ref = this.contents;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.name === name) {
          return file;
        }
      }
      return null;
    };

    Directory.prototype.getFileWithPath = function(path) {
      var file, first, parts, rest, _ref;
      if (!(path != null) || path === "") {
        return this;
      }
      parts = path.split(fs.separator);
      first = parts[0];
      rest = (parts.slice(1)).join(fs.separator);
      if (first === "" || first === ".") {
        return this.getFileWithPath(rest);
      } else if (first === "..") {
        return (_ref = this.parent) != null ? _ref.getFileWithPath(rest) : void 0;
      } else {
        file = this.getFileWithName(first);
        if (file != null) {
          if (file instanceof SymbolicLink) {
            file = file.destination();
          }
          if (file instanceof Directory) {
            return file.getFileWithPath(rest);
          } else {
            if (rest.length === 0) {
              return file;
            } else {
              return null;
            }
          }
        } else {
          return null;
        }
      }
    };

    Directory.prototype.path = function() {
      var parentPath;
      parentPath = this.parent != null ? this.parent.path() : "";
      return fs.join(parentPath, this.name);
    };

    Directory.prototype._dataToFile = function(name, data) {
      if (typeof data === "string") {
        if (data.substr(0, 3) === "-> ") {
          return new SymbolicLink(name, this, data.substr(3));
        } else {
          return new TextFile(name, this, data);
        }
      } else {
        return new Directory(name, this, data);
      }
    };

    return Directory;

  })(File);

}).call(this);
