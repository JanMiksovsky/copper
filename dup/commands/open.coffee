###
Open file for editing
###

commands.open = ( args... ) ->

  for arg in args
    file = env.currentDirectory.getFileWithPath arg
    unless file?
      stdout.writeln "open: #{arg}: No such file or directory"
      return
    if file instanceof Directory
      stdout.writeln "open: #{arg}: Is a directory"
      return

    if file.contents?
      Cookie.set "fileContents", file.contents
      window.open "editFile.html"