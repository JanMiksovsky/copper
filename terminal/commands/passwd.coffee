commands.passwd = ( phone ) ->

  if not phone?
    stdout.writeln "usage: passwd &lt;phone number&gt;"
    return

  stdout.writeln "passwd: Changing password for #{phone}"