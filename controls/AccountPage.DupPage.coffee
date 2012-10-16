class window.AccountPage extends DupPage

  inherited:
    content: [
      "<div>Enter your address in any Google Maps-friendly format (e.g.: \"123 Main St., Anytown, NY\"):</div>",
      { control: "TextBoxWithButton2", ref: "address" }
    ]

  address: Control.chain "$address", "content"

  initialize: ->
    @$address().find( "input" ).focus()
    @$address().on "goButtonClick", =>
      window.location = "agent/satellite.html?address=#{@address()}"