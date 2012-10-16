class window.RegisterPage extends DupPage

  inherited:
    content: "Register here"

  initialize: ->
    facebookAuthorizer.authorize "136995693107715", "http://localhost/copper/dup/citizen/register.html"

  ###
  initialize: ->
    console?.log "loading Facebook script..."
    if $( "script#facebook-jssdk" ).length > 0
      return
    js = $( "script" )[0]
    js.async = true
    js.src = "//connect.facebook.net/en_US/all.js"
    $( "script" ).before js

window.fbAsyncInit = ->
  console?.log "fbAsyncInit"
  FB.init
    appId: "136995693107715"
    channelUrl: "//localhost/copper/dup/channel.html" # Channel File
    status: true # check login status
    cookie: true # enable cookies to allow the server to access the session
    xfbml: true # parse XFBML
  FB.login =>
    FB.api "/me", ( data ) =>
      console?.log "Your name is " + data.name
  ###