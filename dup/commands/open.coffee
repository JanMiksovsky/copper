###
Open a file.
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
      # Save contents for viewer/editor to find.
      filePath = file.path()
      Cookie.set filePath, file.contents
      page = switch file.extension()
        when "dup"
          "editor.html" # DUP program
        else
          "viewFile.html" # Anything else
      url = "#{page}#path=#{filePath}"
      window.open url
