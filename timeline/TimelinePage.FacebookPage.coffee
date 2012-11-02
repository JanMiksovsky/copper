class window.TimelinePage extends FacebookPage
  
  inherited:
    # Many of the refs use Facebook's name to facilitate borrowing their styles.
    content: [
      html: "div", ref: "fbTimelineSection", content: [
        html: "div", ref: "coverWrap", content: [
          control: "GoogleImageSearch"
          ref: "coverPhoto"
          apiKey: "AIzaSyBv9uyS4BISNFq3Nqy1nEIacR8rZq9mbKQ"
          searchEngine: "012110630167570475131:yb8gc1mbcwk"
          imageSize: "xlarge"
        ]
      ,
        html: "div", ref: "fbTimelineHeadline", content: [
          html: "div", ref: "photoContainer", content:
            html: "div", ref: "profilePicThumb", content:
              html: "div", ref: "uiScaledImageContainer", content:
                html: "img", ref: "TimelinePage_profilePhoto"
        ,
          html: "div", ref: "actions", content: [
            control: "FacebookButton", content: "Friends"
          ,
            control: "FacebookButton", content: "Message"
          ,
            control: "FacebookButton", ref: "buttonAbout", content: "What's This?"
          ]
        ,
          html: "h2", ref: "TimelinePage_name"
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

  city: Control.chain( "$aboutTile", "city", ( city ) ->
    @$coverPhoto().query "#{city} skyline"
  )

  cityPage: Control.chain "$aboutTile", "cityPage"
  college: Control.chain "$aboutTile", "college"
  collegePage: Control.chain "$aboutTile", "collegePage"
  employer: Control.chain "$aboutTile", "employer"
  employerPage: Control.chain "$aboutTile", "employerPage"
  infoTiles: Control.chain "$TimelinePage_infoTiles", "prop/src"

  initialize: ->
    @$buttonAbout().click =>
      Dialog.showDialog AboutDialog

    # If city photo loads and is too tall, vertically center it
    $coverPhoto = @$coverPhoto()
    $coverPhoto.load =>
      coverPhotoHeight = $coverPhoto.height()
      containerHeight = @$coverWrap().height()
      if coverPhotoHeight > containerHeight
        $coverPhoto.css "top", ( containerHeight - coverPhotoHeight ) / 2

  major: Control.chain "$aboutTile", "major"

  name: Control.chain( "$TimelinePage_name", "content", ( name ) ->
    @$timeline().author name
  )

  position: Control.chain "$aboutTile", "position"
  posts: Control.chain "$timeline", "items"
  profilePhoto: Control.chain "$TimelinePage_profilePhoto", "prop/src"
