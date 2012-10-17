class window.RegisterPage extends DupPage

  inherited:
    content: [
      { html: "div", ref: "RegisterPage_content" }
      { control: List, ref: "friendList", mapFunction: name: "content" }
    ]
    title: "Compulsory Citizen Registation"

  content: Control.chain "$RegisterPage_content", "content"

  initialize: ->
    Facebook.currentUser ( data ) =>
      console?.log data.name
      Facebook.currentUserFriends ( data ) =>
        friends = data.slice 0, 10
        @$friendList().items friends