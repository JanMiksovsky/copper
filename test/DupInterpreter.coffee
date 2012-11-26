###
DUP interpreter unit tests
###

$ ->

  interpreter = null

  module "DUP interpreter tests",
    setup: ->
      interpreter = new DupInterpreter()

  stackEqual = ( expected ) ->
    deepEqual interpreter.stack, expected

  test "DUP: reset", ->
    interpreter.push 1
    stackEqual [ 1 ]
    interpreter.reset()
    stackEqual []

  test "DUP: push", ->
    stackEqual []
    interpreter.push 1
    stackEqual [ 1 ]
    interpreter.push 2
    stackEqual [ 1, 2 ]

  test "DUP: pop", ->
    stackEqual []
    interpreter.push 1
    stackEqual [ 1 ]
    interpreter.pop()
    stackEqual []

  test "DUP: execute", ->
    interpreter.push 1
    interpreter.push 2
    interpreter.execute "+"
    stackEqual [ 3 ]
  
  test "DUP: parse integer", ->
    interpreter.execute "123"
    stackEqual [ 123 ]

  ###
  Commands
  ###

  test "DUP: +", ->
    stackEqual []
    interpreter.push 1
    interpreter.push 2
    interpreter[ "+" ]()
    stackEqual [ 3 ]
