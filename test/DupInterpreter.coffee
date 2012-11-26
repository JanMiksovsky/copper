###
DUP interpreter unit tests
###

$ ->

  interpreter = null

  module "DUP interpreter tests",
    setup: ->
      interpreter = new DupInterpreter()

  stackEqual = ( expectedStack ) ->
    deepEqual interpreter.stack, expectedStack

  runEqual = ( program, expectedStack ) ->
    interpreter.run program
    stackEqual expectedStack

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

  test "DUP: + (add)", ->
    runEqual "1 2+", [ 3 ]

  test "DUP: $ (dup)", ->
    runEqual "1$", [ 1, 1]

  test "DUP: % (drop)", ->
    runEqual "1%", []

  test "DUP: & (AND)", ->
    runEqual "6 3&", [ 2 ]

  test "DUP: * (multiply)", ->
    runEqual "2 3*", [ 6 ]

  test "DUP: - (subtract)", ->
    runEqual "3 1-", [ 2 ]

  test "DUP: / (divide)", ->
    runEqual "7 3/", [ 1, 2 ]

  test "DUP: < (less than)", ->
    runEqual "1 2<", [ -1 ]
    runEqual "2 1<", [ 0 ]

  test "DUP: = (equals)", ->
    runEqual "1 1=", [ -1 ]
    runEqual "1 2=", [ 0 ]

  test "DUP: > (greater than)", ->
    runEqual "2 1>", [ -1 ]
    runEqual "1 2>", [ 0 ]

  test "DUP: @ (rotate)", ->
    runEqual "1 2 3@", [ 2, 3, 1 ]

  test "DUP: \ (swap)", ->
    runEqual "1 2\\", [ 2, 1 ]

  test "DUP: ß (flush)", ->
    runEqual "ß", []

  test "DUP: ø (pick)", ->
    runEqual "1 2 3 4 5 3ø", [ 1, 2, 3, 4, 5, 2 ]

  test "DUP: _ (negate)", ->
    runEqual "3_", [ -3 ]

  test "DUP: | (XOR)", ->
    runEqual "1 2|", [ 3 ]

  test "DUP: ~ (NOT)", ->
    runEqual "0~", [ -1 ]

  test "DUP: « (left shift)", ->
    runEqual "1 3«", [ 8 ]

  test "DUP: » (right shift)", ->
    runEqual "8 3»", [ 1 ]
