###
Chat test page.
###

class window.ChatPage extends Page

  inherited:
    content: [
      control: "Log", ref: "log"
    ,
      control: TextBoxWithButton, ref: "userInput"
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

  userInput: Control.chain "$userInput", "content"
