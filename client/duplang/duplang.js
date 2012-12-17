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
An interpreter for the DUP programming language, a variant of FALSE.
DUP created by Ian Osgood, FALSE by Wouter van Oortmerssen.
http://esolangs.org/wiki/DUP
*/


(function() {

  window.DupInterpreter = (function() {

    function DupInterpreter(program) {
      this.program = program;
      this.reset();
    }

    DupInterpreter.prototype.commands = null;

    DupInterpreter.prototype.end = function() {
      return this.goto(this.program.length);
    };

    DupInterpreter.prototype.input = "";

    DupInterpreter.prototype.inputPosition = null;

    DupInterpreter.prototype.goto = function(index) {
      return this.pc = index;
    };

    DupInterpreter.prototype.matches = null;

    DupInterpreter.MAX_CYCLES = 10000;

    DupInterpreter.prototype.memory = null;

    DupInterpreter.prototype.run = function(program, stack) {
      var character, command, cycles, index, item, number, _i, _len;
      if (program != null) {
        this.program = program;
      }
      this.reset();
      if (stack != null) {
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          item = stack[_i];
          this.push(item);
        }
      }
      if (this.program == null) {
        return;
      }
      number = null;
      cycles = 0;
      while (this.pc < this.program.length) {
        index = this.pc;
        character = this.program[index];
        if (/\d/.test(character)) {
          number = (number != null ? number : 0) * 10 + parseInt(character);
        } else {
          if (number != null) {
            this.tracePush(number, index - 1);
            number = null;
          }
          if (!/\s/.test(character)) {
            command = this.commands[character];
            if (command != null) {
              command.call(this);
              this.traceOperator(character, index);
            } else {
              this.tracePush(character, index);
            }
          }
        }
        this.pc++;
        if (++cycles > DupInterpreter.MAX_CYCLES) {
          this.writeString("*** Program Runtime Exceeded ***");
          return this;
        }
      }
      if (number != null) {
        this.tracePush(number, this.pc - 1);
        number = null;
      }
      return this;
    };

    DupInterpreter.prototype.pc = null;

    DupInterpreter.prototype.pick = function(n) {
      return this.stack[this.stack.length - 1 - n];
    };

    DupInterpreter.prototype.pop = function() {
      return this.stack.pop();
    };

    DupInterpreter.prototype.push = function(n) {
      return this.stack.push(n);
    };

    DupInterpreter.prototype.read = function() {
      if (this.inputPosition < this.input.length) {
        return this.input[this.inputPosition++];
      } else {
        return null;
      }
    };

    DupInterpreter.prototype.reset = function() {
      var command, value, _ref;
      this.commands = {};
      _ref = DupInterpreter.commands;
      for (command in _ref) {
        value = _ref[command];
        this.commands[command] = value;
      }
      this.inputPosition = 0;
      this.output = "";
      this.matches = [];
      this.stack = [];
      this.returnStack = [];
      this.memory = [];
      this.trace = [];
      return this.goto(0);
    };

    DupInterpreter.prototype.returnStack = null;

    DupInterpreter.prototype.seek = function(character) {
      var index, start;
      start = this.pc;
      index = this.matches[start];
      if (index == null) {
        index = this.program.indexOf(character, this.pc + 1);
        this.matches[start] = index;
      }
      if (index < 0) {
        return this.end;
      } else {
        return this.goto(index);
      }
    };

    DupInterpreter.prototype.seekRightBracket = function() {
      var character, start;
      start = this.pc;
      if (this.matches[start] != null) {
        return this.goto(this.matches[start]);
      } else {
        while (this.pc < this.program.length) {
          character = this.program.charAt(++this.pc);
          switch (character) {
            case "]":
              this.matches[start] = this.pc;
              return;
            case "[":
              this.seekRightBracket();
              break;
            case "\"":
              this.seek("\"");
              break;
            case "{":
              this.seek("}");
              break;
            case "'":
              this.pc++;
          }
        }
      }
    };

    DupInterpreter.prototype.stack = null;

    DupInterpreter.prototype.trace = null;

    DupInterpreter.prototype.traceOperator = function(op, index) {
      var after, before, contextLength, stack;
      switch (op) {
        case "[":
        case "]":
        case "{":
          return;
      }
      if (op != null) {
        contextLength = 4;
        before = index < contextLength ? this.program.substr(0, index) : this.program.substr(index - contextLength, contextLength);
        after = this.program.substr(index + 1, contextLength);
      } else {
        before = null;
        after = null;
      }
      stack = this.stack.slice();
      return this.trace.push({
        op: op,
        index: index,
        stack: stack,
        before: before,
        after: after
      });
    };

    DupInterpreter.prototype.tracePush = function(item, index) {
      var op;
      this.push(item);
      op = item.toString();
      op = op.slice(op.length - 1);
      return this.traceOperator(op, index);
    };

    DupInterpreter.prototype.write = function(character) {
      return this.output += character;
    };

    DupInterpreter.prototype.writeString = function(s) {
      var c, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = s.length; _i < _len; _i++) {
        c = s[_i];
        _results.push(this.write(c));
      }
      return _results;
    };

    return DupInterpreter;

  })();

  /*
  DUP built-in commands
  
  This collection is maintained on the DupInterpreter class. It's copied to
  interpreter instances before the interpreter runs, because the ⇒ operator can
  destructively modify the built-in commands. This ensures that one program run
  can't contaminate subsequent program runs.
  
  The comments use FORTH notation to indicate a function's effects on the stack.
  Example: the notation ( a b -- a+b ) indicates the function takes two numbers
  a and b off the stack and leaves their sum.
  */


  DupInterpreter.commands = {
    "!": function() {
      this.returnStack.push(this.pc);
      return this.goto(this.pop());
    },
    "#": function() {
      var body, condition, flag, isWhileMarker, lambda, topOfReturn;
      topOfReturn = this.returnStack[this.returnStack.length - 1];
      isWhileMarker = topOfReturn === this.pc;
      if (!isWhileMarker) {
        body = this.pop();
        condition = this.pop();
        lambda = condition;
      } else {
        this.returnStack.pop();
        flag = this.returnStack.pop();
        body = this.returnStack.pop();
        condition = this.returnStack.pop();
        lambda = flag === 0 ? this.pop() === 0 ? null : body : condition;
      }
      if (lambda != null) {
        flag = lambda === condition ? 0 : 1;
        this.returnStack.push(condition);
        this.returnStack.push(body);
        this.returnStack.push(flag);
        this.returnStack.push(this.pc);
        this.returnStack.push(this.pc - 1);
        return this.goto(lambda);
      }
    },
    "$": function() {
      return this.push(this.pick(0));
    },
    "%": function() {
      return this.pop();
    },
    "&": function() {
      return this.push(this.pop() & this.pop());
    },
    "'": function() {
      var code;
      code = this.program.charCodeAt(++this.pc);
      return this.push(code);
    },
    "(": function() {
      return this.returnStack.push(this.pop());
    },
    ")": function() {
      return this.push(this.returnStack.pop());
    },
    "*": function() {
      return this.push(this.pop() * this.pop());
    },
    "+": function() {
      return this.push(this.pop() + this.pop());
    },
    ",": function() {
      var character;
      character = String.fromCharCode(this.pop());
      return this.write(character);
    },
    "-": function() {
      return this.push(-this.pop() + this.pop());
    },
    ".": function() {
      return this.write(this.pop());
    },
    "/": function() {
      var denominator, numerator, quotient, remainder;
      denominator = this.pop();
      numerator = this.pop();
      quotient = numerator / denominator;
      quotient = quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
      remainder = numerator % denominator;
      this.push(remainder);
      return this.push(quotient);
    },
    ":": function() {
      var address;
      address = this.pop();
      return this.memory[address] = this.pop();
    },
    ";": function() {
      var address;
      address = this.pop();
      return this.push(this.memory[address]);
    },
    "<": function() {
      return this.push(-(this.pop() > this.pop()));
    },
    "=": function() {
      return this.push(-(this.pop() === this.pop()));
    },
    ">": function() {
      return this.push(-(this.pop() < this.pop()));
    },
    "?": function() {
      var condition, falseLambda, lambda, trueLambda;
      falseLambda = this.pop();
      trueLambda = this.pop();
      condition = this.pop();
      lambda = condition ? trueLambda : falseLambda;
      this.returnStack.push(this.pc);
      return this.goto(lambda);
    },
    "@": function() {
      var a, b, c;
      c = this.pop();
      b = this.pop();
      a = this.pop();
      this.push(b);
      this.push(c);
      return this.push(a);
    },
    "[": function() {
      this.push(this.pc);
      return this.seekRightBracket();
    },
    "\\": function() {
      var a, b;
      b = this.pop();
      a = this.pop();
      this.push(b);
      return this.push(a);
    },
    "ß": function() {},
    "ø": function() {
      return this.push(this.pick(this.pop()));
    },
    "]": function() {
      return this.goto(this.returnStack.pop());
    },
    "^": function() {
      return this.push(this.pick(1));
    },
    "_": function() {
      return this.push(-this.pop());
    },
    "`": function() {
      var character, code;
      character = this.read();
      code = (character != null ? character.length : void 0) > 0 ? character.charCodeAt(0) : -1;
      return this.push(code);
    },
    "{": function() {
      return this.seek("}");
    },
    "|": function() {
      return this.push(this.pop() ^ this.pop());
    },
    "~": function() {
      return this.push(~this.pop());
    },
    "«": function() {
      var shift;
      shift = this.pop();
      return this.push(this.pop() << shift);
    },
    "»": function() {
      var shift;
      shift = this.pop();
      return this.push(this.pop() >>> shift);
    },
    "⇒": function() {
      var character, lambda,
        _this = this;
      lambda = this.pop();
      character = this.program.charAt(++this.pc);
      return this.commands[character] = function() {
        _this.returnStack.push(_this.pc);
        return _this.goto(lambda);
      };
    },
    '"': function() {
      var i, length, memoryStart, stringEnd, stringStart, _i, _ref;
      memoryStart = this.pop();
      stringStart = this.pc + 1;
      this.seek("\"");
      stringEnd = this.pc - 1;
      length = stringEnd - stringStart + 1;
      for (i = _i = 0, _ref = length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.memory[memoryStart + i] = this.program.charCodeAt(stringStart + i);
      }
      return this.push(memoryStart + length);
    }
  };

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupEditorPage = (function(_super) {

    __extends(DupEditorPage, _super);

    function DupEditorPage() {
      return DupEditorPage.__super__.constructor.apply(this, arguments);
    }

    DupEditorPage.prototype.inherited = {
      content: {
        control: HorizontalPanels,
        constrainHeight: true,
        content: {
          control: VerticalPanels,
          ref: "leftPane",
          top: {
            control: MenuBar,
            content: [
              {
                control: Menu,
                content: "Programs",
                popup: {
                  control: List,
                  ref: "sampleProgramList",
                  itemClass: "DupSampleMenuItem"
                }
              }, {
                html: "<span>    Run = Ctrl+Enter</span>",
                ref: "instruction"
              }
            ]
          },
          content: {
            control: "DupProgram",
            ref: "program"
          },
          bottom: {
            control: Tabs,
            ref: "tabs",
            generic: false,
            tabButtonClass: "DupTabButton",
            content: [
              {
                control: "DupHelpPane",
                ref: "helpPane"
              }, {
                control: "DupInputPane",
                ref: "inputPane"
              }, {
                control: "DupOutputPane",
                ref: "outputPane"
              }
            ]
          }
        },
        right: {
          control: "DupStackTrace",
          ref: "stackTrace"
        }
      },
      fill: true,
      generic: false,
      title: "DUP Editor"
    };

    DupEditorPage.prototype.clear = Control.chain("$outputPane", "clear");

    DupEditorPage.prototype.defaultProgram = "{ Type code here, then press Ctrl+Enter. Try: \"1 1 + .\" }\n";

    DupEditorPage.prototype.input = Control.chain("$inputPane", "content");

    DupEditorPage.prototype.initialize = function() {
      var _ref,
        _this = this;
      this.$sampleProgramList().items(this.samplePrograms);
      this.$sampleProgramList().on("click", ".DupSampleMenuItem", function(event) {
        var menuItem, src;
        menuItem = $(event.target).control();
        if (menuItem != null) {
          src = menuItem.src();
          if (src != null) {
            src = "examples/" + src;
          }
          return _this.loadFile(src);
        }
      });
      this.$stackTrace().on("selectionChanged", function() {
        return typeof console !== "undefined" && console !== null ? console.log(_this.$stackTrace().selectedStep().index) : void 0;
      });
      $(document).on("keydown", function(event) {
        if (event.which === 13 && event.ctrlKey) {
          _this.run();
          return false;
        }
      });
      this.$program().blur(function() {
        return Cookie.set("program", _this.program());
      });
      this.program((_ref = Cookie.get("program")) != null ? _ref : this.defaultProgram);
      this.run();
      return this.$program().focus();
    };

    DupEditorPage.prototype.loadFile = function(src) {
      var _this = this;
      if (src != null) {
        return $.get(src, function(program) {
          return _this.loadProgram(program);
        });
      } else {
        this.$tabs().selectedTabIndex(0);
        return this.loadProgram("");
      }
    };

    DupEditorPage.prototype.loadProgram = function(program) {
      this.program(program);
      this.run();
      return this.$program().focus();
    };

    DupEditorPage.prototype.program = Control.chain("$program", "content");

    DupEditorPage.prototype.read = Control.chain("$inputPane", "read");

    DupEditorPage.prototype.run = function() {
      var interpreter, n, stack, stackParam, wroteOutput,
        _this = this;
      stackParam = this.urlParameters().stack;
      if (stackParam != null) {
        stack = (function() {
          var _i, _len, _ref, _results;
          _ref = stackParam.split(",");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push(parseInt(n));
          }
          return _results;
        })();
      }
      this.$inputPane().position(0);
      this.clear();
      wroteOutput = false;
      interpreter = new DupInterpreter();
      interpreter.read = function() {
        var _ref;
        return (_ref = _this.read()) != null ? _ref : -1;
      };
      interpreter.write = function(s) {
        wroteOutput = true;
        return _this.write(s);
      };
      interpreter.run(this.program(), stack);
      this.$stackTrace().trace(this.shiftTrace(interpreter.trace, stack));
      if (wroteOutput) {
        this.$tabs().selectedTabIndex(2);
      }
      return this.save();
    };

    DupEditorPage.prototype.samplePrograms = [
      {
        content: "New"
      }, {
        content: "Hello, world",
        src: "hello.dup"
      }, {
        content: "Factorial",
        src: "factorial.dup"
      }, {
        content: "Power",
        src: "power.dup"
      }, {
        content: "Strings",
        src: "strings.dup"
      }, {
        content: "Temperature",
        src: "temp.dup"
      }, {
        content: "Threat Assessment",
        src: "threat.dup"
      }
    ];

    DupEditorPage.prototype.save = function() {
      Cookie.set("program", this.program());
      return this.$inputPane().save();
    };

    DupEditorPage.prototype.shiftTrace = function(trace, initialStack) {
      var after, before, index, op, previousStack, shiftedStep, shiftedTrace, stack, step;
      shiftedTrace = [];
      previousStack = initialStack != null ? initialStack : [];
      shiftedTrace = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = trace.length; _i < _len; _i++) {
          step = trace[_i];
          op = step.op, index = step.index, stack = step.stack, before = step.before, after = step.after;
          shiftedStep = {
            op: op,
            index: index,
            stack: previousStack,
            before: before,
            after: after
          };
          previousStack = step.stack;
          _results.push(shiftedStep);
        }
        return _results;
      })();
      if (previousStack.length > 0) {
        shiftedTrace.push({
          op: "",
          stack: previousStack,
          before: "",
          after: ""
        });
      }
      return shiftedTrace;
    };

    DupEditorPage.prototype.write = Control.chain("$outputPane", "write");

    return DupEditorPage;

  })(Page);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupProgram = (function(_super) {

    __extends(DupProgram, _super);

    function DupProgram() {
      return DupProgram.__super__.constructor.apply(this, arguments);
    }

    DupProgram.prototype.inherited = {
      content: [
        {
          html: "<div>&nbsp;</div>",
          ref: "highlight"
        }, {
          html: "<textarea spellcheck='false'/>",
          ref: "programText"
        }
      ]
    };

    DupProgram.prototype.content = Control.chain("$programText", "content");

    DupProgram.prototype.highlightVisible = Control.chain("$highlight", "visibility");

    return DupProgram;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupSampleMenuItem = (function(_super) {

    __extends(DupSampleMenuItem, _super);

    function DupSampleMenuItem() {
      return DupSampleMenuItem.__super__.constructor.apply(this, arguments);
    }

    DupSampleMenuItem.prototype.src = Control.property();

    return DupSampleMenuItem;

  })(MenuItem);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupStackTrace = (function(_super) {

    __extends(DupStackTrace, _super);

    function DupStackTrace() {
      return DupStackTrace.__super__.constructor.apply(this, arguments);
    }

    DupStackTrace.prototype.inherited = {
      content: [
        {
          html: "<tr>",
          ref: "heading",
          content: [
            {
              html: "<td>Stack</td>",
              ref: "columnHeadingStack"
            }, {
              html: "<td>&nbsp;&nbsp;</td>"
            }, {
              html: "<td/>"
            }, {
              html: "<td>⇣</td>"
            }, {
              html: "<td>Current op</td>"
            }
          ]
        }, {
          control: List,
          ref: "stepList",
          itemClass: "DupStackTraceStep"
        }
      ]
    };

    DupStackTrace.prototype.trace = Control.chain("$stepList", "items");

    return DupStackTrace;

  })(Control);

}).call(this);


/*
A single step in a DUP stack trace
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupStackTraceStep = (function(_super) {

    __extends(DupStackTraceStep, _super);

    function DupStackTraceStep() {
      return DupStackTraceStep.__super__.constructor.apply(this, arguments);
    }

    DupStackTraceStep.prototype.inherited = {
      content: [
        {
          html: "<td>",
          ref: "stack"
        }, {
          html: "<td>&nbsp;&nbsp;</td>"
        }, {
          html: "<td>",
          ref: "before"
        }, {
          html: "<td>",
          ref: "op"
        }, {
          html: "<td>",
          ref: "after"
        }
      ]
    };

    DupStackTraceStep.prototype.after = Control.chain("$after", "content");

    DupStackTraceStep.prototype.before = Control.chain("$before", "content");

    DupStackTraceStep.prototype.op = Control.chain("$op", "content");

    DupStackTraceStep.prototype.stack = Control.property(function(stack) {
      return this.$stack().content(stack.join(" "));
    });

    DupStackTraceStep.prototype.tag = "tr";

    return DupStackTraceStep;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupTab = (function(_super) {

    __extends(DupTab, _super);

    function DupTab() {
      return DupTab.__super__.constructor.apply(this, arguments);
    }

    return DupTab;

  })(Tab);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupTabButton = (function(_super) {

    __extends(DupTabButton, _super);

    function DupTabButton() {
      return DupTabButton.__super__.constructor.apply(this, arguments);
    }

    DupTabButton.prototype.inherited = {
      generic: false
    };

    return DupTabButton;

  })(BasicButton);

}).call(this);


/*
A text box that can supports a read() method which returns the next character
in the text.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.TextBoxStream = (function(_super) {

    __extends(TextBoxStream, _super);

    function TextBoxStream() {
      return TextBoxStream.__super__.constructor.apply(this, arguments);
    }

    TextBoxStream.prototype.content = function(content) {
      var result;
      result = TextBoxStream.__super__.content.call(this, content);
      if (content != null) {
        this.position(0);
      }
      return result;
    };

    TextBoxStream.prototype.initialize = function() {
      return this.position(0);
    };

    TextBoxStream.prototype.read = function() {
      var character, content, position;
      content = this.content();
      position = this.position();
      if (position < content.length) {
        character = content[position++];
        this.position(position);
      } else {
        character = null;
      }
      return character;
    };

    TextBoxStream.prototype.position = Control.property();

    TextBoxStream.prototype.tag = "textarea";

    return TextBoxStream;

  })(Control);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupHelpPane = (function(_super) {

    __extends(DupHelpPane, _super);

    function DupHelpPane() {
      return DupHelpPane.__super__.constructor.apply(this, arguments);
    }

    DupHelpPane.prototype.inherited = {
      content: [
        {
          html: "<pre>",
          content: "Stack Op  Effect\n    n !   Call function at index n\n  c b #   While condition c is true, do b  \n    a $   Duplicate a\n    a %   Drop a\n  a b &   a AND b\n      '   Push next character on stack\n    a (   Push a to return stack\n      )   Pop from return stack\n  a b *   a*b\n  a b +   a+b\n    n ,   Output Unicode character n\n  a b -   a-b\n    a .   Output integer a\n  a b /   a/b\n  a n :   Store a at memory address n\n    n ;   Fetch from memory address n\n  a b <   -1 if a < b, else 0\n  a b =   -1 if a = b, else 0"
        }, {
          html: "<pre>",
          content: "  a b >   -1 if a > b, else 0\nc t f ?   If c is non-zero, do t, else f\na b c @   b c a (rotate)\n      [   Begin function, leave index\n  a b \\   b a (swap)\n... n ø   Pick nth item from top\n      ]   Return from function\n  a b ^   Copy a to top of stack\n    n _   Negative n\n      `   Read character from input\n      {   Start comment\n      }   End comment\n  a b |   a XOR b\n    a ~   NOT a\n  a n «   Shift a's bits left by n places\n  a n »   Shift a's bits right by n places\n    f ⇒  Define next character as a function\n    n \"   Copy string to memory address n"
        }
      ],
      description: "Help"
    };

    return DupHelpPane;

  })(DupTab);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupInputPane = (function(_super) {

    __extends(DupInputPane, _super);

    function DupInputPane() {
      return DupInputPane.__super__.constructor.apply(this, arguments);
    }

    DupInputPane.prototype.inherited = {
      content: {
        control: "TextBoxStream",
        ref: "DupInputPane_content"
      },
      description: "Input"
    };

    DupInputPane.prototype.content = Control.chain("$DupInputPane_content", "content");

    DupInputPane.prototype.initialize = function() {
      var _this = this;
      this.$DupInputPane_content().blur(function() {
        return _this.save();
      });
      return this.load();
    };

    DupInputPane.prototype.load = function() {
      var input;
      input = Cookie.get("input");
      if (input != null) {
        return this.content(input);
      }
    };

    DupInputPane.prototype.position = Control.chain("$DupInputPane_content", "position");

    DupInputPane.prototype.read = Control.chain("$DupInputPane_content", "read");

    DupInputPane.prototype.save = function() {
      return Cookie.set("input", this.content());
    };

    return DupInputPane;

  })(DupTab);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DupOutputPane = (function(_super) {

    __extends(DupOutputPane, _super);

    function DupOutputPane() {
      return DupOutputPane.__super__.constructor.apply(this, arguments);
    }

    DupOutputPane.prototype.inherited = {
      content: {
        control: "Log",
        ref: "log"
      },
      description: "Output"
    };

    DupOutputPane.prototype.clear = Control.chain("$log", "clear");

    DupOutputPane.prototype.write = Control.chain("$log", "write");

    return DupOutputPane;

  })(DupTab);

}).call(this);
