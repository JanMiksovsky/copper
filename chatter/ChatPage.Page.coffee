class window.ChatPage extends Page

  inherited:
    content: [
      control: "Log", ref: "log"
    ,
      control: TextBoxWithButton2, ref: "userInput"
    ]

  initialize: ->
    @$userInput().on "goButtonClick", =>
      input = @userInput()
      @$log().writeln input
      response = ChatterBot.respond input
      @$log().writeln response
      @userInput ""
    @inDocument =>
      @$userInput().find( "input" ).focus()
    ChatterBot.test()

  userInput: Control.chain "$userInput", "content"
