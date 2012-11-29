###
DUP interpreter unit tests
###

$ ->

  interpreter = null
  input = null
  output = null

  module "DUP interpreter",
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

  test "reset", ->
    interpreter.push 1
    stackEqual [ 1 ]
    interpreter.reset()
    stackEqual []

  test "push", ->
    stackEqual []
    interpreter.push 1
    stackEqual [ 1 ]
    interpreter.push 2
    stackEqual [ 1, 2 ]

  test "pop", ->
    stackEqual []
    interpreter.push 1
    stackEqual [ 1 ]
    interpreter.pop()
    stackEqual []

  ###
  Commands
  ###

  test "parse integer", ->
    runEqual "123", [ 123 ]

  test "! (execute lambda)", ->
    runEqual "2[1+]!", [ 3 ]
    deepEqual interpreter.returnStack, []
    runEqual "[1+]a: 2a;!", [ 3 ]

  test "# (while)", ->
    # Find first power of 2 greater than or equal to 100
    runEqual "2[$100<][2*]#", [ 128 ]

  test "+ (add)", ->
    runEqual "1 2+", [ 3 ]

  test ", (output character)", ->
    runEqual "65,", []
    equal output, "A"

  test "$ (dup)", ->
    runEqual "1$", [ 1, 1]

  test "% (drop)", ->
    runEqual "1%", []

  test "& (AND)", ->
    runEqual "6 3&", [ 2 ]

  test "' (character code)", ->
    runEqual "'A", [ 65 ]

  test "( (push to return stack)", ->
    runEqual "1(", []
    deepEqual interpreter.returnStack, [ 1 ]

  test ") (pop from return stack)", ->
    runEqual "1(2)", [ 2, 1 ]
    deepEqual interpreter.returnStack, []

  test "* (multiply)", ->
    runEqual "2 3*", [ 6 ]

  test "- (subtract)", ->
    runEqual "3 1-", [ 2 ]

  test ". (output number)", ->
    runEqual "10 10*.", []
    equal output, "100"

  test "/ (divide)", ->
    runEqual "7 3/", [ 1, 2 ]

  test ": (store in memory)", ->
    runEqual "7 3:", []
    deepEqual interpreter.memory, [ undefined, undefined, undefined, 7 ]
    runEqual "1a:", []
    equal interpreter.memory.a, 1

  test "; (retrieve from memory)", ->
    runEqual "7 3: 1 2+;", [ 7 ]
    runEqual "1a:a;a;+", [ 2 ]

  test "< (less than)", ->
    runEqual "1 2<", [ -1 ]
    runEqual "2 1<", [ 0 ]

  test "= (equals)", ->
    runEqual "1 1=", [ -1 ]
    runEqual "1 2=", [ 0 ]

  test "> (greater than)", ->
    runEqual "2 1>", [ -1 ]
    runEqual "1 2>", [ 0 ]

  test "? (if)", ->
    runEqual "0[2][3]?", [ 3 ]
    runEqual "1[2][3]?", [ 2 ]

  test "@ (rotate)", ->
    runEqual "1 2 3@", [ 2, 3, 1 ]

  test "[ (begin lambda)", ->
    runEqual "[1+]2", [ 0, 2 ]

  test "\\ (swap)", ->
    runEqual "1 2\\", [ 2, 1 ]

  test "ß (flush)", ->
    runEqual "ß", []

  test "ø (pick)", ->
    runEqual "1 2 3 4 5 3ø", [ 1, 2, 3, 4, 5, 2 ]

  test "] (end lambda)", ->
    # Sequence "(]" is effectively GOTO to a specific index in program + 1.
    # So this should skip over the "8" and execute the "9".
    runEqual "3(]89", [ 9 ]

  test "ignore ] as a quoted character", ->
    runEqual "[']]!", [ 93 ] # Value of right bracket character

  test "ignore ] in a quoted string", ->
    # Store a string with a single right bracket at memory position 0, check it.
    runEqual "[0\"]\"%]! 0;", [ 93 ]

  test "ignore ] in a comment", ->
    runEqual "[{ Comment with a bracket] }1]!", [ 1 ]

  test "nested lambdas", ->
    # Outer lambda pushes a 1 if TOS is non-zero, 2 if zero
    runEqual "0[[1][2]?]!", [ 2 ]

  test "^ (over)", ->
    runEqual "3 2^", [ 3, 2, 3 ]

  test "_ (negate)", ->
    runEqual "3_", [ -3 ]

  test "` (read character)", ->
    input = "ABC"
    runEqual "````", [ 65, 66, 67, -1 ]

  test "{ (begin comment)", ->
    runEqual "{ This is a comment } 1", [ 1 ]

  test "| (XOR)", ->
    runEqual "1 2|", [ 3 ]

  test "~ (NOT)", ->
    runEqual "0~", [ -1 ]

  test "« (left shift)", ->
    runEqual "1 3«", [ 8 ]

  test "» (right shift)", ->
    runEqual "8 3»", [ 1 ]

  test "⇒ (define)", ->
    runEqual "[2*]⇒d 3dd", [ 12 ]

  test "unknown character gets pushed onto stack", ->
    runEqual "abc", [ "a", "b", "c" ]

  test "\" (string)", ->
    runEqual "1\"ABC\"", [ 4 ]
    deepEqual interpreter.memory, [ undefined, 65, 66, 67 ]

  ###
  The following integration tests come from Ian Osgood's DUP demos at
  http://www.quirkster.com/iano/js/dup.html
  ###
  test "factorial program", ->
    runEqual "[$1>[$1-f;!*][%1]?]f: 6f;!", [ 720 ]

  test "greatest common denominator program", ->
    runEqual "[[$][\\^/%]#%]g: 12 8g;! 63 18g;! 53 25g;!", [ 4, 9, 1 ]

  test "integer power program", ->
    runEqual "[1\\[2/\\[@@^*@][]?$][@$*@@]#%\\%]p: 3 5p;!", [ 243 ]

  ###
  Trace functionality
  ###

  test "trace", ->
    runEqual "1 1+", [ 2 ]
    deepEqual interpreter.trace, [
      op: "1"
      index: 0
      before: ""
      after: " 1+"
      stack: [ 1 ]
    ,
      op: "1"
      index: 2
      before: "1 "
      after: "+"
      stack: [ 1, 1 ]
    ,
      op: "+"
      index: 3
      before: "1 1"
      after: ""
      stack: [ 2 ]
    ]