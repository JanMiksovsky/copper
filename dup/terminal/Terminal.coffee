class window.Terminal extends Control

  inherited:
    content: [
      control: "Log", ref: "log"
    ,
      control: "HorizontalPanels"
      left:
        html: "pre", ref: "prompt"
      content:
        html: "<input type='text' spellcheck='false'/>", ref: "userInput"
    ]

  clear: Control.chain "$log", "clear"    

  initialize: ->
    @click => @restoreFocus()
    @$userInput().keydown ( event ) =>
      switch event.which
        when 13 # Enter
          @_handleInput()
          false
        when 38 # Up
          @_navigateHistory 1
          false
        when 40 # Down
          @_navigateHistory -1
          false
    @inDocument ->
      @restoreFocus()

  history: Control.property( null, [] )

  # The index into the history of commands, 1 = most recent command,
  # 2 = next most recent command, etc.
  historyPosition: Control.property null, 0

  prompt: Control.chain "$prompt", "content"

  readln: ( callback ) ->
    @prompt env.prompt
    @restoreFocus()
    @scrollToUserInput()
    @_readlnCallbacks().push callback

  # If the focus was lost for some reason, put it back on the user input area.
  restoreFocus: ->
    @$userInput().focus()

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

  _navigateHistory: ( step ) ->
    history = @history()
    position = @historyPosition()
    position += step
    if position > 0 and position <= history.length
      command = history[ history.length - position ]
      @userInput command
      @historyPosition position

  _readlnCallbacks: Control.property( null, [] )

  _handleInput: ->
    input = @userInput()
    @write @prompt()
    @writeln input
    @userInput ""
    @history().push input
    @historyPosition 0
    callback = @_readlnCallbacks().pop()
    if callback?
      callback.call @, input