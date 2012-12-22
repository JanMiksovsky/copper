###
Print the current (working) directory.
###

commands.pwd = ->
  stdout.writeln env.currentDirectory.path()