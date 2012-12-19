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
      window.location = "register.html"
    @$linkAbout().click => Dialog.showDialog AboutDialog
