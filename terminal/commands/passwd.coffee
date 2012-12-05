###
Change password from within terminal.

TODO: Actually save password, or remove this command, or leave this command but
have it just spit out a message like "Please use the agent verification system
to change your password." (I.e., point people at the IVR.)
###

commands.passwd = ( phone, password ) ->

  if not ( phone? and password? )
    stdout.writeln "usage: passwd [phone number] [new password]"
    return

  # env.prompt = "Enter new password: "
  # window.stdout = terminal
  # terminal.readln ( password ) ->
  #   if password == ""
  #     return
  #   commands.passwd phone

  validator = new PasswordValidator phone
  message = validator.validate password
  stdout.writeln message