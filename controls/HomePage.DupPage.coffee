class window.HomePage extends DupPage

  inherited:
    content: [
      "<h1>Department of Unified Protection</h1>"
      "All citizens must register"
    ]

  initialize: ->
    @inDocument ->
      facebookAuthorizer.authorize "136995693107715", "http://localhost/copper/dup/citizen/register.html"
