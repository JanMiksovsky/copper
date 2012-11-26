###
An interpreter for the DUP programming language, a variant of FALSE.
DUP created by Ian Osgood, FALSE by Wouter van Oortmerssen.
http://esolangs.org/wiki/DUP
###

class window.DupInterpreter

  constructor: ->
    @stack = []

  pop: ->
    @stack.pop()

  push: ( n ) ->
    @stack.push n

  add: ->
    @push @pop() + @pop()

  # Parse the given string and execute the commands in the given program.
  execute: ( program ) ->

  # Reset the machine state, then execute the given program.
  run: ( program ) ->
