###
An interpreter for the DUP programming language, a variant of FALSE.
DUP created by Ian Osgood, FALSE by Wouter van Oortmerssen.
http://esolangs.org/wiki/DUP
###

class window.DupInterpreter

  constructor: ->
    @reset()

  # Parse the given string and execute the commands in the given program.
  execute: ( program ) ->
    number = null
    for character in program
      if /\d/.test character
        # Add digit to current number
        number = ( number ? 0 ) * 10 + parseInt character
      else
        if number?
          # Reached the end of a number, push that first.
          @stack.push number
          number = null
        # Ignore whitespace
        unless /\s/.test character
          # Execute command
          @[ character ]()
    if number?
      # Program ended with a number; push that.
      @stack.push number
    # Return the interpreter so calls can be chained
    @

  pop: ->
    @stack.pop()

  push: ( n ) ->
    @stack.push n

  # Reset the machine state.
  reset: ->
    @stack = []

  # Reset the machine state, then execute the given program.
  run: ( program ) ->
    @reset()
    @execute program

  # The stack
  stack: []

  ###
  Commands
  ###

  "+": ->
    @push @pop() + @pop()
