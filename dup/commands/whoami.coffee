###
Print the name of the current user.
###

commands.whoami = ->
  stdout.writeln env.userName