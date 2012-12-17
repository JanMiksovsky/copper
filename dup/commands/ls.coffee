commands.ls = ( arg ) ->

  if arg?
    file = env.currentDirectory.getFileWithPath arg
    unless file?
      stdout.writeln "ls: #{arg}: No such file or directory"
      return
  else
    file = env.currentDirectory

  if file instanceof Directory
    fileNames = ( child.name for child in file.contents )
    # TODO: May need to supply sorting for older browsers.
    fileNames.sort()
    output = columns.format fileNames
    if output.length > 0
      stdout.writeln output
  else
    stdout.writeln file.name