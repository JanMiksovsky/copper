$ ->

  stackEqual = ( code, expected ) ->
    program = new DupProgram code
    output = program.run()
    deepEqual output, expected

  test "dup: hello", ->
    stackEqual "hello", 5