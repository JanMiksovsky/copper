class window.HomePage extends DupPage

  inherited:
    content: [
      "<p>All citizens must register</p>"
    ,
      control: BasicButton, ref: "buttonRegister", content: "Register now"
    ,
      html: "p", content:
        control: Link, ref: "linkAbout", content: "What's this?"
    ]
    title: "Department of Unified Protection"

  initialize: ->
    @$buttonRegister().click =>
      # TODO: Generalize
      Facebook.authorize "136995693107715", "http://localhost/copper/client/register.html", [ "email", "user_birthday" ]
    @$linkAbout().click =>
      Dialog.showDialog Dialog,
        cancelOnOutsideClick: true
        closeOnInsideClick: true
        content:
          """
          <h1>This is a game</h1>
          <p>
          This game is produced by [SCEA?] and [more legalese here].
          All characters appearing in this work are fictitious. Any resemblance
          to real persons, living or dead, is purely coincidental.
          </p>
          """
        width: "500px"

  test: ->
    $.post "http://localhost:5000/verify/jan@miksovsky.com", null, ( data ) =>
      debugger