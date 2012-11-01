class window.HomePage extends DupPage

  inherited:
    content: [
      html: "<img src='resources/flag.jpg'/>", ref: "flag"
    ,
      html: "div", ref: "main", content: [
        """
        <h2>Compulsory Citizen Registration</h2>
        <p>
        For your safety, all citizens are required to register with this agency.
        </p>
        """
      ,
        control: BasicButton, ref: "buttonRegister", content: "Register now"
      ,
        html: "p", ref: "footer", content:
          control: Link, ref: "linkAbout", content: "What's this?"
      ]
    ]
    title: "Department of Unified Protection"

  initialize: ->
    @$buttonRegister().click =>
      @register()
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

  # Send the user to the registration page.
  register: ->
    applicationId = Application.id()
    # Facebook auth needs an absolute URL, but we want this app to be able to
    # run in multiple locations (localhost, etc.), so we build a URL ourselves.
    parts = window.location.href.split "/"
    parts[ parts.length - 1 ] = "register.html" # Replace page
    url = parts.join "/"

    Facebook.authorize applicationId, url, [ "email", "user_birthday" ]
