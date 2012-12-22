###
A list of suspected people, either real or fake.
###

class window.SuspectList extends Control

  inherited:
    content: [
      { html: "<img src='resources/progressIndicator.gif'/>", ref: "progressIndicator" }
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
    suspects = FakeSuspects.select 5, friends

    # Add in some of the user's friends
    selectedFriends = @_selectFriends friends, 3
    for friend in selectedFriends
      suspects.push
        id: friend.id
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

  # Randomly select the indicated number of friends.
  _selectFriends: ( friends, count ) ->
    shuffled = Utilities.shuffle friends
    return shuffled.splice 0, count