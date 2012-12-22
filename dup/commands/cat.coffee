###
Concatenate files
###

commands.cat = ( args... ) ->
  for arg in args
    file = env.currentDirectory.getFileWithPath arg
    unless file?
      stdout.writeln "cat: #{arg}: No such file or directory"
      return
    if file instanceof Directory
      stdout.writeln "cat: #{arg}: Is a directory"
      return
    if file.contents?
      stdout.write file.contents