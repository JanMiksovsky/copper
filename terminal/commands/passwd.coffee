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

  