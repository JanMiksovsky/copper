class window.DupEditorPage extends Page

  inherited:
    content:
      control: HorizontalPanels
      constrainHeight: true
      content:
        control: VerticalPanels
        ref: "leftPane"
        content:
          html: "<textarea/>", ref: "program", content: "[$1>[$1-f*][%1]?]⇒f 6f."
        bottom:
          control: "DupHelp", ref: "helpPane", class: "pane"
      right:
        control: "DupStackTrace", ref: "stackTrace", class: "pane"
    fill: true
    title: "DUP Editor"

  initialize: ->

    $( document ).on "keydown", ( event ) =>
      if event.which == 13 and event.ctrlKey
        @run()
    @$program().blur =>
      Cookie.set "program", @program()

    # Load any program that was being edited.
    program = Cookie.get "program"
    @program program if program?
    @$program().focus()

    @run()

  program: Control.chain "$program", "content"

  run: ->
    # See if the URL specifies a stack as comma separated integers.
    stackParam = @urlParameters().stack
    if stackParam?
      # Convert stack to array of integers
      stack = ( parseInt n for n in stackParam.split "," )

    program = @program()
    interpreter = new DupInterpreter()
    interpreter.write = ( s ) -> console?.log s
    interpreter.run program, stack
    @$stackTrace().items interpreter.trace # trace

    # Auto-save program only after successful completion.
    Cookie.set "program", @program()