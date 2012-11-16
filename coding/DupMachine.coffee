class window.DupMachine

  constructor: ->
    @stack = []

  pop: ->
    @stack.pop()

  push: ( n ) ->
    @stack.push n

  add: ->
    @push @pop() + @pop()
