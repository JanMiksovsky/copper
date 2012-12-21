###
Open a file in a EditFileDialog.
###

commands.open = ( args... ) ->

  if args?.length > 1
    stdout.writeln "usage: open [file]"
    return

  arg = args[0]
  file = env.currentDirectory.getFileWithPath arg
  unless file?
    stdout.writeln "open: #{arg}: No such file"
    return
  if not file instanceof TextFile
    stdout.writeln "open: #{arg}: not a text file"
    return

  # Prepare to open a dialog that can edit the indicated file.
  path = file.path()
  editorClass = switch file.extension()
    when "dup"
      DupFileEditor # DUP program
    else
      TextEditor # Anything else
  options = { path, editorClass }

  # Open the editor.
  Dialog.showDialog EditFileDialog, options, =>
    # User closed editor.
    terminal.restoreFocus()
