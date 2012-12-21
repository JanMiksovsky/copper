###
Execute a DUP program
###

commands.dup = ( args... ) ->

  if args[0]?.substr( args[0].length - 4 ) == ".dup"
    # Argument is a DUP file path, possibly followed by initial stack
    file = env.currentDirectory.getFileWithPath args[0]
    unless file?
      stdout.writeln "dup: #{arg}: No such file"
      return
    unless file instanceof TextFile
      stdout.writeln "dup: #{file.name} is not a DUP program"
      return
    program = file.contents
    stack = ( parseInt( arg ) for arg in args.slice 1 )
  else
    # Arguments are a DUP program
    program = args.join " "

  interpreter = new DupInterpreter()
  # Direct program output to stdout
  interpreter.write = ( s) => stdout.write s
  interpreter.run program, stack
  stdout.writeln ""