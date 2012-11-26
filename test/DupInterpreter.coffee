$ ->

  test "DUP: push", ->
    interpreter = new DupInterpreter()
    deepEqual interpreter.stack, []
    interpreter.push 1
    deepEqual interpreter.stack, [ 1 ]
    interpreter.push 2
    deepEqual interpreter.stack, [ 1, 2 ]

  test "DUP: add", ->
    interpreter = new DupInterpreter()
    deepEqual interpreter.stack, []
    interpreter.push 1
    interpreter.push 2
    interpreter.add()
    deepEqual interpreter.stack, [ 3 ]
