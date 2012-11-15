
/*
Build-time class to generate the ranges of allowable password combinations.
*/


(function() {
  var PasswordCombinations, path;

  PasswordCombinations = (function() {

    function PasswordCombinations() {}

    PasswordCombinations.checksum = function(trigram) {
      return parseInt(trigram[0]) + parseInt(trigram[1]) + parseInt(trigram[2]);
    };

    PasswordCombinations.counterparts = function(trigram) {
      var reduced;
      reduced = this.subtract(trigram, this.digits);
      return this.trigrams(reduced);
    };

    PasswordCombinations.digits = "0123456789";

    PasswordCombinations.factorial = function(n) {
      if (n <= 1) {
        return 1;
      } else {
        return n * this.factorial(n - 1);
      }
    };

    PasswordCombinations.ranges = function() {
      var ranges, sum, _i, _len, _ref;
      ranges = {};
      _ref = this.trigramSums(this.trigrams(this.digits));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sum = _ref[_i];
        ranges[sum] = [];
      }
      return ranges;
    };

    PasswordCombinations.subtract = function(charsToRemove, s) {
      var regex;
      regex = new RegExp("[" + charsToRemove + "]", "g");
      return s.replace(regex, "");
    };

    PasswordCombinations.permutations = function(s, n) {
      var char, i, rest, result, subpermutation, _i, _j, _len, _len1, _ref;
      result = [];
      if (n > 0) {
        for (i = _i = 0, _len = s.length; _i < _len; i = ++_i) {
          char = s[i];
          rest = s.substr(0, i) + s.slice(i + 1);
          if (n === 1) {
            result.push(char);
          } else {
            _ref = this.permutations(rest, n - 1);
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              subpermutation = _ref[_j];
              result.push(char + subpermutation);
            }
          }
        }
      }
      return result;
    };

    PasswordCombinations.sortString = function(s) {
      var array, char, item, result, _i, _len, _ref;
      array = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = s.length; _i < _len; _i++) {
          char = s[_i];
          _results.push(char);
        }
        return _results;
      })();
      result = "";
      _ref = array.sort();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        result += item;
      }
      return result;
    };

    PasswordCombinations.trigrams = function(s) {
      return this.uniquePermutations(s, 3);
    };

    PasswordCombinations.trigramPairs = function(s) {
      var combinations, counterpart, result, trigram, _i, _len, _ref;
      result = [];
      _ref = this.trigrams(s);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        trigram = _ref[_i];
        combinations = (function() {
          var _j, _len1, _ref1, _results;
          _ref1 = this.counterparts(trigram);
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            counterpart = _ref1[_j];
            _results.push([trigram, counterpart]);
          }
          return _results;
        }).call(this);
        result = result.concat(combinations);
      }
      return result;
    };

    PasswordCombinations.trigramSums = function(trigrams) {
      var sum, sums, trigram, _i, _len;
      sums = [];
      for (_i = 0, _len = trigrams.length; _i < _len; _i++) {
        trigram = trigrams[_i];
        sum = this.checksum(trigram);
        if (sums.indexOf(sum) < 0) {
          sums.push(sum);
        }
      }
      return sums;
    };

    PasswordCombinations.unique = function(array) {
      var item, result, _i, _len;
      result = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (result.indexOf(item) < 0) {
          result.push(item);
        }
      }
      return result;
    };

    PasswordCombinations.uniquePermutations = function(s, n) {
      var permutation, permutations, sorted;
      permutations = this.permutations(s, n);
      sorted = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = permutations.length; _i < _len; _i++) {
          permutation = permutations[_i];
          _results.push(this.sortString(permutation));
        }
        return _results;
      }).call(this);
      return this.unique(sorted);
    };

    return PasswordCombinations;

  })();

  if ((typeof require !== "undefined" && require !== null) && (typeof process !== "undefined" && process !== null)) {
    path = require("path");
    if (path.basename(process.argv[1]) === "PasswordCombinations.js") {
      if (typeof console !== "undefined" && console !== null) {
        console.log(PasswordCombinations.trigramPairs(PasswordCombinations.digits));
      }
    }
  }

}).call(this);
