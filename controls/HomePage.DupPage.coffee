class window.HomePage extends DupPage

  inherited:
    content: [
      "<h1>Department of Unified Protection</h1>"
      "<p>All citizens must register</p>"
      { control: Link, ref: "linkRegister", content: "Register now" }
    ]

  initialize: ->
    @$linkRegister().click =>
      Facebook.authorize "136995693107715", "http://localhost/copper/dup/citizen/register.html"
