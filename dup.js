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
      return "" + this._baseUrl + user.id + "/picture?access_token=" + this.accessToken;
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

  window.RegisterPage = (function(_super) {

    __extends(RegisterPage, _super);

    function RegisterPage() {
      return RegisterPage.__super__.constructor.apply(this, arguments);
    }

    RegisterPage.prototype.inherited = {
      content: [
        {
          html: "div",
          ref: "RegisterPage_content"
        }, {
          control: List,
          ref: "friendList",
          mapFunction: {
            name: "content"
          }
        }
      ],
      title: "Compulsory Citizen Registation"
    };

    RegisterPage.prototype.content = Control.chain("$RegisterPage_content", "content");

    RegisterPage.prototype.initialize = function() {
      var _this = this;
      return Facebook.currentUser(function(data) {
        if (typeof console !== "undefined" && console !== null) {
          console.log(data.name);
        }
        return Facebook.currentUserFriends(function(data) {
          var friends;
          friends = data.slice(0, 10);
          return _this.$friendList().items(friends);
        });
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
