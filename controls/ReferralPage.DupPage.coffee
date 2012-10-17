class window.ReferralPage extends DupPage

  inherited:
    content: [
      """<p>
      Identify one of the following:
      </p>"""
      { control: List, ref: "suspectList", itemClass: "SuspectTile", mapFunction: "suspect" }
    ]
    title: "Citizen Watch Program"

  # Create a lineup using a randomly selected friend plus some random suspects.
  createLineup: ( friends ) ->

    # Get random suspects
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

  initialize: ->
    Math.seedrandom()
    Facebook.currentUser ( data ) =>
      Facebook.currentUserFriends ( data ) =>
        @createLineup data
