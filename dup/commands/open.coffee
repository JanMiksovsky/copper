###
Open a file in a FileEditor.
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
      editorClass = switch file.extension()
        when "dup"
          DupFileEditor # DUP program
        else
          FileEditor # Anything else
      options =
        path: filePath
      Dialog.showDialog editorClass, options, =>
        # User closed editor.
        terminal.restoreFocus()