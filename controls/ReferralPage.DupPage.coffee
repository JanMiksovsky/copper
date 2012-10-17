class window.ReferralPage extends DupPage

  inherited:
    content: [
      """<p>
      Identify one of the following:
      </p>"""
      { control: List, ref: "suspectList", itemClass: "SuspectTile", mapFunction: "suspect" }
      { html: "p", content: [
        "If you do not recognize any of the individuals shown, you may request to "
        { control: Link, ref: "linkReload", content: "view more photos" }
        "."
      ]}
    ]
    title: "Citizen Watch Program"

  # Create a lineup using a randomly selected friend plus some random suspects.
  createLineup: ->

    # Hide lineup for the moment.
    @$suspectList().css "visibility", "hidden"

    # Get random suspects
    friends = @friends()
    suspects = Suspects.select 3, friends

    # Add in one of the user's friends
    friendIndex = Math.floor Math.random() * friends.length
    friend = friends[ friendIndex ]
    suspects.push
      name: friend.name
      picture: Facebook.pictureUrlForUser friend

    # Shuffle and display
    shuffled = Utilities.shuffle suspects
    @$suspectList().items shuffled

    # Give the photos a bit of time to load.
    setTimeout ( => @$suspectList().css "visibility", "inherit" ), 1000

  friends: Control.property()

  initialize: ->
    Facebook.currentUser ( data ) =>
      Facebook.currentUserFriends ( friends ) =>
        @friends friends
        @createLineup()
    @$linkReload().click => @createLineup()
