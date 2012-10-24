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
      var content, control, date, post, posts;
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
        content: ["Apparently those government people are interested in the places, but\nwe don't know where they are. Can anyone help?"]
      }, {
        date: "May 15",
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
