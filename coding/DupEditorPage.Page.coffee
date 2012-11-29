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
          control: Tabs
          ref: "tabs"
          generic: false
          tabButtonClass: "DupTabButton"
          content: [
            control: "DupHelpPane", ref: "helpPane"
          ,
            control: "DupInputPane", ref: "inputPane"
          ,
            control: "DupOutputPane", ref: "outputPane"
          ]
      right:
        control: "DupStackTrace", ref: "stackTrace"
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

    @$stackTrace().items @shiftTrace interpreter.trace, stack

    # Auto-save program only after successful completion.
    Cookie.set "program", @program()

  # The trace actually looks better if the stack for step n is shown to the
  # left of the op for step n+1, so we shift all the stacks down a step.
  shiftTrace: ( trace, initialStack ) ->
    shiftedTrace = []
    previousStack = initialStack ? []
    shiftedTrace = ( for step in trace
      { op, stack, before, after } = step
      shiftedStep = { op, stack: previousStack, before, after }
      previousStack = step.stack
      shiftedStep
    )
    if previousStack.length > 0
      # If the program left something on the stack, show that as a final step.
      shiftedTrace.push
        op: ""
        stack: previousStack
        before: ""
        after: ""
    shiftedTrace