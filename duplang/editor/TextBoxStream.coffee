###
A text box that can supports a read() method which returns the next character
in the text.
###

class window.TextBoxStream extends Control

  content: ( content ) ->
    result = super content
    if content?
      @position 0
    result

  initialize: ->
    @position 0

  # Returns the next character in the input, or null if at end of input.
  read: ->
    content = @content()
    position = @position()
    if position < content.length
      character = content[ position++ ]
      @position position
    else
      character = null
    character

  position: Control.property()

  tag: "textarea"
