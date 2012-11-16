$ ->

  test "machine: push", ->
    machine = new DupMachine()
    deepEqual machine.stack, []
    machine.push 1
    deepEqual machine.stack, [ 1 ]
    machine.push 2
    deepEqual machine.stack, [ 1, 2 ]

  test "machine: add", ->
    machine = new DupMachine()
    deepEqual machine.stack, []
    machine.push 1
    machine.push 2
    machine.add()
    deepEqual machine.stack, [ 3 ]
