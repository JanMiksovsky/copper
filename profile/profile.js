// Generated by CoffeeScript 1.3.3
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

  window.TimelinePage = (function(_super) {

    __extends(TimelinePage, _super);

    function TimelinePage() {
      return TimelinePage.__super__.constructor.apply(this, arguments);
    }

    TimelinePage.prototype.inherited = {
      content: {
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
                    html: "div",
                    ref: "aboutTile",
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
                                    html: "span",
                                    ref: "workIcon",
                                    "class": "facebookIcon"
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
                                    html: "span",
                                    ref: "collegeIcon",
                                    "class": "facebookIcon"
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
                                    html: "span",
                                    ref: "cityIcon",
                                    "class": "facebookIcon"
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
                                    html: "span",
                                    ref: "birthdayIcon",
                                    "class": "facebookIcon"
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
                  }
                }
              }
            }
          }
        ]
      }
    };

    TimelinePage.prototype.birthday = Control.chain("$TimelinePage_birthday", "content");

    TimelinePage.prototype.city = Control.chain("$TimelinePage_city", "content");

    TimelinePage.prototype.cityPage = Control.chain("$TimelinePage_city", "href");

    TimelinePage.prototype.college = Control.chain("$TimelinePage_college", "content");

    TimelinePage.prototype.collegePage = Control.chain("$TimelinePage_college", "href");

    TimelinePage.prototype.coverPhoto = Control.chain("$TimelinePage_coverPhoto", "prop/src");

    TimelinePage.prototype.employer = Control.chain("$TimelinePage_employer", "content");

    TimelinePage.prototype.employerPage = Control.chain("$TimelinePage_employer", "href");

    TimelinePage.prototype.major = Control.chain("$TimelinePage_major", "content");

    TimelinePage.prototype.name = Control.chain("$TimelinePage_name", "content");

    TimelinePage.prototype.position = Control.chain("$TimelinePage_position", "content");

    TimelinePage.prototype.profilePhoto = Control.chain("$TimelinePage_profilePhoto", "prop/src");

    return TimelinePage;

  })(FacebookPage);

  window.HeroinePage = (function(_super) {

    __extends(HeroinePage, _super);

    function HeroinePage() {
      return HeroinePage.__super__.constructor.apply(this, arguments);
    }

    HeroinePage.prototype.inherited = {
      birthday: "November 12",
      coverPhoto: "../resources/coverPhoto.jpg",
      name: "Ann Williams",
      profilePhoto: "../resources/profilePhoto.jpg",
      position: "Project Manager",
      employer: "Microsoft Corporation",
      employerPage: "http://www.facebook.com/Microsoft",
      city: "Bellevue, Washington",
      cityPage: "http://www.facebook.com/pages/Bellevue-Washington/111723635511834",
      major: "English",
      college: "Harvey Mudd College",
      collegePage: "http://www.facebook.com/pages/Harvey-Mudd-College/107892159239091"
    };

    return HeroinePage;

  })(TimelinePage);

}).call(this);