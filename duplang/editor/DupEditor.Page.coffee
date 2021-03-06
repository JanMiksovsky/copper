###
An interactive development editor for the DUP programming language.
###

class window.DupEditor extends Page

  inherited:
    content:
      control: HorizontalPanels
      constrainHeight: true
      content:
        control: VerticalPanels
        ref: "leftPane"
        top:
          control: MenuBar, content: [
            html: "div", ref: "customMenus"
          ,
            control: "ExampleProgramsMenu", ref: "exampleProgramsMenu"
          ,
            control: MenuItem, ref: "runButton", content: "Run"
          ,
            html: "<span>(Ctrl+Enter)</span>", ref: "instruction"
          ]
        content:
          control: "DupProgram", ref: "program"
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
    generic: false
    title: "DUP Editor"

  # Clear output pane.
  clear: Control.chain "$outputPane", "clear"

  content: Control.chain "program"

  customMenus: Control.chain "$customMenus", "content"

  defaultProgram: """
    { Type code here, then press Ctrl+Enter. Try: \"1 1 + .\" }

  """

  input: Control.chain "$inputPane", "content"

  initialize: ->

    @$exampleProgramsMenu().on "loadProgram", ( event, program ) =>
      @$tabs().selectedTabIndex 0
      @loadProgram program
    @$runButton().click => @run()

    @$stackTrace().on "selectionChanged", =>
      console?.log @$stackTrace().selectedStep().index

    $( document ).on "keydown", ( event ) =>
      if event.which == 13 and event.ctrlKey
        @run()
        false
    @$program().blur => Cookie.set "program", @program()

    # Load and run any program that was being edited.
    @program ( Cookie.get "program" ) ? @defaultProgram
    @run()

    @$program().focus()

  loadProgram: ( program ) ->
    @program program
    @run()
    @$program().focus()

  program: Control.chain "$program", "content"

  read: Control.chain "$inputPane", "read"

  run: ->

    # See if the URL specifies a stack as comma separated integers.
    stackParam = @urlParameters().stack
    if stackParam?
      # Convert stack to array of integers
      stack = ( parseInt n for n in stackParam.split "," )

    # Reset input and output
    @$inputPane().position 0
    @clear()
    wroteOutput = false

    # Create an interpreter and wire it up to input and output panes.
    interpreter = new DupInterpreter()
    interpreter.read = =>
      @read() ? -1
    interpreter.write = ( s ) =>
      wroteOutput = true
      @write s
    
    # Run program.
    interpreter.run @program(), stack

    # Update stack trace.
    @$stackTrace().trace @shiftTrace interpreter.trace, stack
    if wroteOutput
      @$tabs().selectedTabIndex 2

    # Auto-save program only after successful completion.
    @save()

  samplePrograms: [
    content: "New"
  ,
    content: "Hello, world", src: "hello.dup"
  ,
    content: "Factorial", src: "factorial.dup"
  ,
    content: "Power", src: "power.dup"
  ,
    content: "Strings", src: "strings.dup"
  ,
    content: "Temperature", src: "temp.dup"
  ,
    content: "Threat Assessment", src: "threat.dup"
  ]

  # Save the program and associated test input in a cookie.
  save: ->
    Cookie.set "program", @program()
    @$inputPane().save()

  # The trace actually looks better if the stack for step n is shown to the
  # left of the op for step n+1, so we shift all the stacks down a step.
  shiftTrace: ( trace, initialStack ) ->
    shiftedTrace = []
    previousStack = initialStack ? []
    shiftedTrace = ( for step in trace
      { op, index, stack, before, after } = step
      shiftedStep = { op, index, stack: previousStack, before, after }
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

  write: Control.chain "$outputPane", "write"