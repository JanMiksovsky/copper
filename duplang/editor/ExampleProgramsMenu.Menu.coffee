###
Menu of DUP example programs.
###

class window.ExampleProgramsMenu extends Menu

  inherited:
    content: "Examples"
    popup:
      control: List, ref: "programList", itemClass: "ExampleProgramMenuItem"

  initialize: ->
    @$programList().items dupExamples
    @on "click", ".ExampleProgramMenuItem", ( event ) =>
      menuItem = $( event.target ).control()
      if menuItem?
        @trigger "loadProgram", [ menuItem.program() ]