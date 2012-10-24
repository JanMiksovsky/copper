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
    # TODO: Come up with better way to turn JSON for posts into live controls.
    posts = for post in @_posts
      { date, content } = post
      control = Control.create().json content: content
      content = control.content()
      { date, content }
    @posts posts

  _posts: [
    date: "April 3",  content: """
      I had tix for tonight's show at the Showbox, but there was
      some sort of security checkpoint thing set up on I-5, and it took HOURS
      to get through it. We missed the opening act, and I only show half the
      show. So. Pissed.
    """
  ,
    date: "March 26", content: [
      """
      <p>Apparently those government people are interested in the places, but
      we don't know where they are. Can anyone help?</p>
      """
    ,
      control: FlickrInterestingPhoto, width: "100%"
    ]
  ,
    date: "March 21", content: control: LoremIpsum
  ,
    date: "March 19", content: """
      My friends keep bugging me to come back, so I'm going to give Facebook
      another try.
    """
  ]
