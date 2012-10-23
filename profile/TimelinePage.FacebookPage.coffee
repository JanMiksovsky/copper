class window.TimelinePage extends FacebookPage
  
  inherited:
    # Many of the refs use Facebook's name to facilitate borrowing their styles.
    content:
      html: "div", ref: "fbTimelineSection", content: [
        html: "img", ref: "TimelinePage_coverPhoto"
      ,
        html: "div", ref: "fbTimelineHeadline", content: [
          html: "div", ref: "photoContainer", content:
            html: "div", ref: "profilePicThumb", content:
              html: "div", ref: "uiScaledImageContainer", content:
                html: "img", ref: "TimelinePage_profilePhoto"
        ,
          html: "h2", ref: "TimelinePage_name"
        ]
      ,
        html: "div", ref: "fbTimelineNavigationPagelet", content:
          html: "div", ref: "TimelineNavContent", content:
            html: "div", ref: "fbTimelineNavigation", content:
              html: "div", ref: "fbTimelineTopRow", content:
                html: "div", ref: "aboutTile", content:
                  html: "div", ref: "fbTimelineSummarySectionWrapper", content:
                    html: "div", ref: "detail", content:
                      html: "div", ref: "mat", content:
                        html: "div", ref: "fbTimelineSummarySection", content: [
                          html: "div", ref: "fbProfileBylineFragment", content: [
                            html: "span", ref: "workIcon", class: "facebookIcon"
                          ,
                            html: "span", ref: "TimelinePage_position"
                          ,
                            " at "
                          ,
                            control: "Link", ref: "TimelinePage_employer"
                          ]
                        ,
                          html: "div", ref: "fbProfileBylineFragment", content: [
                            html: "span", ref: "collegeIcon", class: "facebookIcon"
                          ,
                            "Studied "
                          ,
                            html: "span", ref: "TimelinePage_major"
                          ,
                            " at "
                          ,
                            control: "Link", ref: "TimelinePage_college"
                          ]
                        ,
                          html: "div", ref: "fbProfileBylineFragment", content: [
                            html: "span", ref: "cityIcon", class: "facebookIcon"
                          ,
                            "Lives in "
                          ,
                            control: "Link", ref: "TimelinePage_city"
                          ]
                        ,
                          html: "div", ref: "fbProfileBylineFragment", content: [
                            html: "span", ref: "birthdayIcon", class: "facebookIcon"
                          ,
                            "Born on "
                          ,
                            html: "span", ref: "TimelinePage_birthday"
                          ]
                        ]
      ]

  birthday: Control.chain "$TimelinePage_birthday", "content"
  city: Control.chain "$TimelinePage_city", "content"
  cityPage: Control.chain "$TimelinePage_city", "href"
  college: Control.chain "$TimelinePage_college", "content"
  collegePage: Control.chain "$TimelinePage_college", "href"
  coverPhoto: Control.chain "$TimelinePage_coverPhoto", "prop/src"
  employer: Control.chain "$TimelinePage_employer", "content"
  employerPage: Control.chain "$TimelinePage_employer", "href"
  major: Control.chain "$TimelinePage_major", "content"
  name: Control.chain "$TimelinePage_name", "content"
  position: Control.chain "$TimelinePage_position", "content"
  profilePhoto: Control.chain "$TimelinePage_profilePhoto", "prop/src"
