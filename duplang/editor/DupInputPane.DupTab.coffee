###
The DUP editor's Input pane.
###

class window.DupInputPane extends DupTab

  inherited:
    content:
      control: "TextBoxStream", ref: "DupInputPane_content"
    description: "Input"

  content: Control.chain "$DupInputPane_content", "content"

  initialize: ->
    # Proactively save input on blur.
    @$DupInputPane_content().blur => @save()

    # Restore previously saved content.
    @load()

  load: ->
    input = Cookie.get "input"
    @content input if input?

  position: Control.chain "$DupInputPane_content", "position"

  read: Control.chain "$DupInputPane_content", "read"

  save: ->
    Cookie.set "input", @content()