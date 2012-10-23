###
The small box with key personal information shown on an FB timeline page,
right below the profile photo.
###

class window.TimelineAboutTile extends Control

  inherited:
    content:
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
  birthday: Control.chain "$TimelinePage_birthday", "content"
  city: Control.chain "$TimelinePage_city", "content"
  cityPage: Control.chain "$TimelinePage_city", "href"
  college: Control.chain "$TimelinePage_college", "content"
  collegePage: Control.chain "$TimelinePage_college", "href"
  employer: Control.chain "$TimelinePage_employer", "content"
  employerPage: Control.chain "$TimelinePage_employer", "href"
  major: Control.chain "$TimelinePage_major", "content"
  position: Control.chain "$TimelinePage_position", "content"
