class window.SuspectList extends Control

  inherited:
    content: [
      { html: "<img src='/copper/dup/resources/progressIndicator.gif'/>", ref: "progressIndicator" }
      {
        control: List
        ref: "list"
        itemClass: "SuspectTile"
        mapFunction: "suspect"
      }
    ]

  friends: Control.property()

  initialize: ->
    Facebook.currentUser ( data ) =>
      Facebook.currentUserFriends ( friends ) =>
        @friends friends
        @reload()

  # Create a lineup using a randomly selected friend plus some random suspects.
  reload: ->

    @_loaded false

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
    @$list().items shuffled

    # Give the photos a bit of time to load.
    setTimeout ( => @_loaded true ), 1000

  _loaded: Control.property ( loaded ) ->
    @$progressIndicator().toggle !loaded
    @$list().css "visibility", if loaded then "inherit" else "hidden"
