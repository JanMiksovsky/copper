commands.sum = ( args... ) ->
  
  if args.length == 0
    stdout.writeln "usage: sum [files...]"
    return

  result = 0
  for arg in args
    file = env.currentDirectory.getFileWithPath arg
    unless file?
      stdout.writeln "sum: #{arg}: No such file or directory"
      return
    result += commands.sum.sumFile file

  stdout.writeln result

commands.sum.sumDirectory = ( directory ) ->
  result = 0
  for file in directory.contents
    result += commands.sum.sumFile file
  result  

commands.sum.sumFile = ( file ) ->
  if file instanceof Directory
    commands.sum.sumDirectory file
  else if file instanceof TextFile
    commands.sum.sumString file.contents
  else
    0

commands.sum.sumString = ( string ) ->
  string.length