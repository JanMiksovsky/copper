###
A symbolic link in the DUP filesystem.
###

class window.SymbolicLink extends File

  destination: ->
    fs.root.getFileWithPath @contents