class window.DupEditorPage extends Page

  inherited:
    content:
      control: HorizontalPanels
      constrainHeight: true
      content:
        html: "<textarea/>", ref: "program", content: "[$1>[$1-f*][%1]?]⇒f 6f."
      right:
        control: "DupStackTrace", ref: "stackTrace"
    fill: true
    title: "DUP Editor"

  initialize: ->
    $( document ).on "keydown", ( event ) =>
      if event.which == 13 and event.ctrlKey
        @run()
    @$program().focus()
    @run()

  program: Control.chain "$program", "content"

  run: ->
    program = @program()
    interpreter = new DupInterpreter()
    interpreter.write = ( s ) -> console?.log s
    interpreter.run program
    @$stackTrace().items interpreter.trace