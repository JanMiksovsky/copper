###
Confirm that generated DUP fragments correctly calculate the expected PIN.
###

$ ->

  module "GeneratePin"

  interpreter = new DupInterpreter()

  pinEqual = ( program, expectedPIN ) ->
    interpreter.run program
    result = parseInt interpreter.output
    equal result, expectedPIN

  test "generated DUP code fragments calculate expected PINs", ->
    for puzzle in PinGenerator.puzzles()
      pinEqual puzzle.program, puzzle.pin