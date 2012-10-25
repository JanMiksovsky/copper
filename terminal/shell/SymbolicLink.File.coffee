class window.SymbolicLink extends File

  destination: ->
    fs.root.getFileWithPath @contents