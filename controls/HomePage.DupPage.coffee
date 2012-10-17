class window.HomePage extends DupPage

  inherited:
    content: [
      "<p>All citizens must register</p>"
      { control: Link, ref: "linkRegister", content: "Register now" }
    ]
    title: "Department of Unified Protection"

  initialize: ->
    @$linkRegister().click =>
      Facebook.authorize "136995693107715", "http://localhost/copper/dup/citizen/register.html"
