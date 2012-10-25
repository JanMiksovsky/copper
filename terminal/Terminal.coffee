class window.Terminal extends Control

  inherited:
    content: [
      { control: "Log", ref: "log" }
      {
        control: "HorizontalPanels"
        left:
          html: "pre", ref: "prompt"
        content:
          html: "<input type='text' spellcheck='false'/>", ref: "userInput"
      }
    ]

  clear: Control.chain "$log", "clear"    

  focusOnUserInput: ->
    @$userInput().focus()

  initialize: ->
    @click =>
      @focusOnUserInput()
    @$userInput().keydown ( event ) =>
      if event.which == 13 # Enter
        @_handleInput()
    @inDocument ->
      @focusOnUserInput()

  prompt: Control.chain "$prompt", "content"

  readln: ( callback ) ->
    @prompt env.prompt
    @focusOnUserInput()
    @scrollToUserInput()
    @_readlnCallbacks().push callback

  # Scroll to the user input field if it's not in view.
  scrollToUserInput: ->
    $document = $ document
    $userInput = @$userInput()
    userInputBottom = $userInput.offset().top + $userInput.height()
    windowHeight = $( window ).height()
    if userInputBottom > $document.scrollTop() + windowHeight
      # User input off bottom of screen; scroll down.
      $document.scrollTop $document.height() - windowHeight

  userInput: Control.chain "$userInput", "content"

  write: Control.chain "$log", "write"

  writeln: Control.chain "$log", "writeln"

  _readlnCallbacks: Control.property( null, [] )

  _handleInput: ->
    input = @userInput()
    @write @prompt()
    @writeln input
    @userInput ""
    callback = @_readlnCallbacks().shift()
    if callback?
      callback.call @, input