class window.ChatPage extends Page

  inherited:
    content: [
      control: "Log", ref: "log"
    ,
      control: TextBoxWithButton2, ref: "userInput"
    ]

  initialize: ->
    @$userInput().on "goButtonClick", =>
      @$log().writeln @userInput()
      @userInput ""
    @inDocument =>
      @$userInput().find( "input" ).focus()

  userInput: Control.chain "$userInput", "content"
