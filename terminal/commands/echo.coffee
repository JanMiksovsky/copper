commands.echo = ( args... ) ->

  message = args.join " "
  stdout.writeln message