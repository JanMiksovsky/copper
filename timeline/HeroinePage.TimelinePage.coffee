class window.HeroinePage extends TimelinePage

  inherited:
    birthday: "November 12"
    city: "Bellevue, Washington"
    cityPage: "http://www.facebook.com/pages/Bellevue-Washington/111723635511834"
    college: "Harvey Mudd College"
    collegePage: "http://www.facebook.com/pages/Harvey-Mudd-College/107892159239091"
    coverPhoto: "../resources/coverPhoto.jpg"
    employer: "Microsoft Corporation"
    employerPage: "http://www.facebook.com/Microsoft"
    major: "English"
    name: "Ann Williams"
    position: "Project Manager"
    profilePhoto: "../resources/profilePhoto.jpg"

  initialize: ->
    @on "click", ".satelliteSample", =>
      # Dialog.showDialog SatelliteDialog
      window.location = "../satellite"
    # TODO: Come up with better way to turn JSON for posts into live controls.
    posts = for post in @_posts
      { date, content } = post
      control = Control.create().json content: content
      content = control.content()
      { date, content }
    @posts posts

  _posts: [
    date: "July 10", content: [
      """
      Apparently those government people are interested in these places, but
      we don't know where they are. If we could just figure out what they have
      in common, we could help put a stop to whatever they have planned. Can
      anyone help?
      """
    ,
      html: "<img class='satelliteSample' src='../resources/satelliteSample.png'/>"
    ]
  ,
    date: "June 2", content: [
      control: LoremIpsum, sentences: 1
    ,
      control: FlickrInterestingPhoto
    ]
  ,
    date: "May 20", content: control: LoremIpsum
  ,
    date: "May 15", content: control: LoremIpsum, sentences: 1
  ,
    date: "April 27", content: control: FlickrInterestingPhoto
  ,
    date: "April 8", content: [
      control: LoremIpsum, sentences: 1
    ,
      control: FlickrInterestingPhoto
    ]
  ,
    date: "April 3",  content: """
      I had tix for tonight's show at the Showbox, but there was
      some sort of security checkpoint thing set up on I-5, and it took HOURS
      to get through it. We missed the opening act, and I only show half the
      show. So. Pissed.
    """
  ,
    date: "March 29", content: control: LoremIpsum
  ,
    date: "March 22", content: control: LoremIpsum
  ,
    date: "March 21", content: [
      "Love this"
      control: FlickrInterestingPhoto
    ]
  ,
    date: "March 19", content: """
      My friends keep bugging me to come back, so I'm going to give Facebook
      another try.
    """
  ]