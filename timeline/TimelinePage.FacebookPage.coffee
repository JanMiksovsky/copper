class window.TimelinePage extends FacebookPage
  
  inherited:
    # Many of the refs use Facebook's name to facilitate borrowing their styles.
    content: [
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
        ,
          html: "div", ref: "actions", content: [
            control: "FacebookButton", content: "Friends"
          ,
            control: "FacebookButton", content: "Message"
          ,
            control: "FacebookButton", ref: "buttonAbout", content: "What's This?"
          ]
        ]
      ,
        html: "div", ref: "fbTimelineNavigationPagelet", content:
          html: "div", ref: "TimelineNavContent", content:
            html: "div", ref: "fbTimelineNavigation", content:
              html: "div", ref: "fbTimelineTopRow", content: [
                control: "TimelineAboutTile", ref: "aboutTile"
              ,
                html: "img", ref: "TimelinePage_infoTiles"
              ]
      ]
    ,
      control: "Timeline", ref: "timeline"
    ]

  birthday: Control.chain "$aboutTile", "birthday"
  city: Control.chain "$aboutTile", "city"
  cityPage: Control.chain "$aboutTile", "cityPage"
  college: Control.chain "$aboutTile", "college"
  collegePage: Control.chain "$aboutTile", "collegePage"
  coverPhoto: Control.chain "$TimelinePage_coverPhoto", "prop/src"
  employer: Control.chain "$aboutTile", "employer"
  employerPage: Control.chain "$aboutTile", "employerPage"
  infoTiles: Control.chain "$TimelinePage_infoTiles", "prop/src"

  initialize: ->
    @$buttonAbout().click =>
      Dialog.showDialog AboutDialog

  major: Control.chain "$aboutTile", "major"

  name: Control.chain( "$TimelinePage_name", "content", ( name ) ->
    @$timeline().author name
  )

  position: Control.chain "$aboutTile", "position"
  posts: Control.chain "$timeline", "items"
  profilePhoto: Control.chain "$TimelinePage_profilePhoto", "prop/src"
