commands.cd = ( arg ) ->
  if arg?.substr( 0, 1 ) == fs.separator
    stdout.writeln "cd: Absolute addressing disabled due to exigent circumstances."
    return
  directory = if arg?
    env.currentDirectory.getDirectoryWithPath arg
  else
    env.homeDirectory
  if directory
    env.currentDirectory = directory
    stdout.writeln env.currentDirectory.path()
  else
    stdout.writeln "cd: #{arg}: No such file or directory"