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
Wrap access to Facebook.
*/


(function() {

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

  /*
  Deals with selecting random "suspects".
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

    Suspects._picturesFemale = ["/copper/dup/resources/pictures/female1.jpg", "/copper/dup/resources/pictures/female2.jpg", "/copper/dup/resources/pictures/female3.jpg", "/copper/dup/resources/pictures/female4.jpg", "/copper/dup/resources/pictures/female5.jpg", "/copper/dup/resources/pictures/female6.jpg", "/copper/dup/resources/pictures/female7.jpg", "/copper/dup/resources/pictures/female8.jpg", "/copper/dup/resources/pictures/female9.jpg", "/copper/dup/resources/pictures/female10.jpg"];

    Suspects._picturesMale = ["/copper/dup/resources/pictures/male1.jpg", "/copper/dup/resources/pictures/male2.jpg", "/copper/dup/resources/pictures/male3.jpg", "/copper/dup/resources/pictures/male4.jpg", "/copper/dup/resources/pictures/male5.jpg", "/copper/dup/resources/pictures/male6.jpg", "/copper/dup/resources/pictures/male7.jpg", "/copper/dup/resources/pictures/male8.jpg", "/copper/dup/resources/pictures/male9.jpg", "/copper/dup/resources/pictures/male10.jpg"];

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
              html: "<img src='/copper/dup/resources/dupLogo.png'/>",
              ref: "logo"
            }, {
              html: "h1",
              ref: "DupPage_title"
            }
          ]
        }, {
          html: "div",
          ref: "DupPage_content"
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

  /*
  A Google map.
  */


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

  window.HomePage = (function(_super) {

    __extends(HomePage, _super);

    function HomePage() {
      return HomePage.__super__.constructor.apply(this, arguments);
    }

    HomePage.prototype.inherited = {
      content: [
        "<p>All citizens must register</p>", {
          control: Link,
          ref: "linkRegister",
          content: "Register now"
        }
      ],
      title: "Department of Unified Protection"
    };

    HomePage.prototype.initialize = function() {
      var _this = this;
      return this.$linkRegister().click(function() {
        return Facebook.authorize("136995693107715", "http://localhost/copper/dup/citizen/register.html");
      });
    };

    return HomePage;

  })(DupPage);

  window.ReferralPage = (function(_super) {

    __extends(ReferralPage, _super);

    function ReferralPage() {
      return ReferralPage.__super__.constructor.apply(this, arguments);
    }

    ReferralPage.prototype.inherited = {
      content: [
        "<p>\nPlease identify one of the following:\n</p>", {
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
            "It is imperative that you identify at least one individual you know so\nthat we may carry out our mission to keep our nation secure. If you\nabstain from making a selection, your failure to comply  comply may\nsubject you, your family, and your associates to investigation. ", {
              control: Link,
              ref: "linkAbstain",
              content: "Abstain"
            }
          ]
        }
      ],
      title: "Citizen Watch Program"
    };

    ReferralPage.prototype.initialize = function() {
      var _this = this;
      return this.$linkReload().click(function() {
        return _this.$suspectList().reload();
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
        "<p>\nThank you for agreeing to participate in compulsory citizen registration.\nPlease answer all questions truthfully. Your responses will be verified\nagainst other sources.\n</p>", {
          control: BasicButton,
          ref: "submitButton",
          content: "Submit"
        }
      ],
      title: "Compulsory Citizen Registation"
    };

    RegisterPage.prototype.initialize = function() {
      var _this = this;
      return this.$submitButton().click(function() {
        return window.location = "referral.html?applicationId=" + (_this.applicationId()) + "&access_token=" + (_this.accessToken());
      });
    };

    return RegisterPage;

  })(DupPage);

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

  window.SuspectList = (function(_super) {

    __extends(SuspectList, _super);

    function SuspectList() {
      return SuspectList.__super__.constructor.apply(this, arguments);
    }

    SuspectList.prototype.inherited = {
      content: [
        {
          html: "<img src='/copper/dup/resources/progressIndicator.gif'/>",
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

    SuspectTile.prototype.picture = Control.chain("$picture", "prop/src");

    SuspectTile.prototype.suspect = Control.property(function(suspect) {
      return this.picture(suspect.picture);
    });

    SuspectTile.prototype.timestamp = Control.chain("$timestamp", "content");

    SuspectTile.prototype._padZero = function(n) {
      return ("0" + n).substr(-2, 2);
    };

    return SuspectTile;

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
        return window.location = "agent/satellite.html?address=" + (_this.address());
      });
    };

    return AccountPage;

  })(DupPage);

}).call(this);
