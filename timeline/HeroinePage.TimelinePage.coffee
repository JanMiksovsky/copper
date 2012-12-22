###
The fake top-level Facebook timeline page for Copper's heroine.
###

class window.HeroinePage extends TimelinePage

  inherited:
    birthday: "November 12"
    city: "Bellevue, Washington"
    cityPage: "http://www.facebook.com/pages/Bellevue-Washington/111723635511834"
    college: "Harvey Mudd College"
    collegePage: "http://www.facebook.com/pages/Harvey-Mudd-College/107892159239091"
    # coverPhoto: "resources/coverPhoto.jpg"
    employer: "Microsoft Corporation"
    employerPage: "http://www.facebook.com/Microsoft"
    infoTiles: "resources/facebookInfoTiles.png"
    major: "English"
    position: "Project Manager"

  initialize: ->

    @name fakeFacebookUsers.heroine.name
    @profilePhoto fakeFacebookUsers.heroine.picture

    @on "click", ".satelliteSample", =>
      # Dialog.showDialog SatelliteDialog
      window.location = "satellite.html"
    @on "click", ( event ) =>
      # CTRL+clicking on page gives us a way to drop into the debugger with a
      # reference to the page. This is helpful when debugging inside Facebook.
      if event.ctrlKey
        debugger

    # TODO: Come up with better way to turn JSON for posts into live controls.
    posts = for post in @_posts
      { date, content, comments } = post
      control = Control.create().json content: content
      content = control.content()
      { date, content, comments }
    @posts posts

  _posts: [
    date: "July 10", content: [
      """
      <p>
      While those D.U.P. people were busy combing through Frank's house, he
      managed to liberate a USB drive from one of their bags. It had the
      following photos on it. Can anyone help identify where these places are?
      If we could just figure out what they have in common, we could help put a
      stop to whatever they have planned.
      </p>
      """
    ,
      html: "<img class='satelliteSample' src='resources/satelliteSample.png'/>"
    ]
    comments: [
      user: "-2"
      content: "I think these are somewhere in Bellevue."
    ]
  ,
    date: "June 2", content: [
      "<p>Nice shot</p>"
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
      "<p>Wow</p>"
    ,
      control: FlickrInterestingPhoto
    ]
  ,
    date: "April 3",  content: """
      <p>
      I had tix for tonight's show at the Showbox, but there was some sort of
      security checkpoint thing set up on I-5, and it took HOURS to get through
      it. We missed the opening act, and I only got to see half the show. So.
      Pissed.
      </p>
    """
  ,
    date: "March 29", content: control: LoremIpsum
  ,
    date: "March 22", content: control: LoremIpsum
  ,
    date: "March 21", content: [
      "<p>Love this</p>"
    ,
      control: FlickrInterestingPhoto
    ]
  ,
    date: "March 19", content: """
      <p>
      My friends keep bugging me to come back, so I'm going to give Facebook
      another try.
      </p>
    """
  ]
