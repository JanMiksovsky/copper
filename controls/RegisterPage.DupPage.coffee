class window.RegisterPage extends DupPage

  inherited:
    content: [
      "<h1>Register</h1>"
      { html: "div", ref: "RegisterPage_content" }
    ]

  content: Control.chain "$RegisterPage_content", "content"

  initialize: ->
    Facebook.currentUser ( data ) =>
      @content JSON.stringify data