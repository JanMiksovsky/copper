###
DUP interpreter unit tests
###

$ ->

  interpreter = null
  input = null
  output = null

  module "DUP interpreter tests",
    setup: ->
      interpreter = new DupInterpreter()
      input = ""
      output = ""
      interpreter.read = ->
        character = input[0]
        input = input.slice 1
        character
      interpreter.write = ( character ) ->
        output += character

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

  ###
  Commands
  ###

  test "DUP: parse integer", ->
    runEqual "123", [ 123 ]

  test "DUP: ! (execute lambda)", ->
    runEqual "2[1+]!", [ 3 ]
    deepEqual interpreter.returnStack, []
    runEqual "[1+]a: 2a;!", [ 3 ]

  test "DUP: # (while)", ->
    # Find first power of 2 greater than or equal to 100
    runEqual "2[$100<][2*]#", [ 128 ]

  test "DUP: + (add)", ->
    runEqual "1 2+", [ 3 ]

  test "DUP: , (output character)", ->
    runEqual "65,", []
    equal output, "A"

  test "DUP: $ (dup)", ->
    runEqual "1$", [ 1, 1]

  test "DUP: % (drop)", ->
    runEqual "1%", []

  test "DUP: & (AND)", ->
    runEqual "6 3&", [ 2 ]

  test "DUP: ' (character code)", ->
    runEqual "'A", [ 65 ]

  test "DUP: ( (push to return stack)", ->
    runEqual "1(", []
    deepEqual interpreter.returnStack, [ 1 ]

  test "DUP: ) (pop from return stack)", ->
    runEqual "1(2)", [ 2, 1 ]
    deepEqual interpreter.returnStack, []

  test "DUP: * (multiply)", ->
    runEqual "2 3*", [ 6 ]

  test "DUP: - (subtract)", ->
    runEqual "3 1-", [ 2 ]

  test "DUP: . (output number)", ->
    runEqual "10 10*.", []
    equal output, "100"

  test "DUP: / (divide)", ->
    runEqual "7 3/", [ 1, 2 ]

  test "DUP: : (store in memory)", ->
    runEqual "7 3:", []
    deepEqual interpreter.memory, [ undefined, undefined, undefined, 7 ]
    runEqual "1a:", []
    equal interpreter.memory.a, 1

  test "DUP: ; (retrieve from memory)", ->
    runEqual "7 3: 1 2+;", [ 7 ]
    runEqual "1a:a;a;+", [ 2 ]

  test "DUP: < (less than)", ->
    runEqual "1 2<", [ -1 ]
    runEqual "2 1<", [ 0 ]

  test "DUP: = (equals)", ->
    runEqual "1 1=", [ -1 ]
    runEqual "1 2=", [ 0 ]

  test "DUP: > (greater than)", ->
    runEqual "2 1>", [ -1 ]
    runEqual "1 2>", [ 0 ]

  test "DUP: ? (if)", ->
    runEqual "0[2][3]?", [ 3 ]
    runEqual "1[2][3]?", [ 2 ]

  test "DUP: @ (rotate)", ->
    runEqual "1 2 3@", [ 2, 3, 1 ]

  test "DUP: [ (begin lambda)", ->
    runEqual "[1+]2", [ 0, 2 ]

  test "DUP: \\ (swap)", ->
    runEqual "1 2\\", [ 2, 1 ]

  test "DUP: ß (flush)", ->
    runEqual "ß", []

  test "DUP: ø (pick)", ->
    runEqual "1 2 3 4 5 3ø", [ 1, 2, 3, 4, 5, 2 ]

  test "DUP: ] (end lambda)", ->
    # Sequence "(]" is effectively GOTO to a specific index in program + 1.
    # So this should skip over the "8" and execute the "9".
    runEqual "3(]89", [ 9 ]

  test "DUP: _ (negate)", ->
    runEqual "3_", [ -3 ]

  test "DUP: ` (read character)", ->
    input = "ABC"
    runEqual "````", [ 65, 66, 67, -1 ]

  test "DUP: { (begin comment)", ->
    runEqual "{ This is a comment } 1", [ 1 ]

  test "DUP: | (XOR)", ->
    runEqual "1 2|", [ 3 ]

  test "DUP: ~ (NOT)", ->
    runEqual "0~", [ -1 ]

  test "DUP: « (left shift)", ->
    runEqual "1 3«", [ 8 ]

  test "DUP: » (right shift)", ->
    runEqual "8 3»", [ 1 ]

  test "DUP: ⇒ (define)", ->
    runEqual "[2*]⇒d 3dd", [ 12 ]

  test "DUP: unknown character gets pushed onto stack", ->
    runEqual "abc", [ "a", "b", "c" ]

  test "DUP: \" (string)", ->
    runEqual "1\"ABC\"", [ 4 ]
    deepEqual interpreter.memory, [ undefined, 65, 66, 67 ]