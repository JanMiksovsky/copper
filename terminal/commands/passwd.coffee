commands.passwd = ( phone ) ->

  if not phone?
    stdout.writeln "usage: passwd &lt;phone number&gt;"
    return

  stdout.writeln "passwd: Changing password for #{phone}"
  env.prompt = "Enter new password: "
  window.stdout = terminal
  terminal.readln ( password ) ->
    if password == ""
      return
    commands.passwd phone
