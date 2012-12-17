class window.Directory extends File

  addFile: ( file ) ->
    file.parent = @
    @contents.push file

  constructor: ( @name, @parent, fileData ) ->
    @contents = ( @_dataToFile name, data for name, data of fileData )

  exists: ( path ) ->
    ( @getFileWithPath path )?

  getDirectoryWithPath: ( path ) ->
    file = @getFileWithPath path
    if file instanceof Directory
      file
    else
      null

  getFileWithName: ( name ) ->
    for file in @contents
      if file.name == name
        return file
    null

  getFileWithPath: ( path ) ->
    if not path? or path == ""
      return @
    parts = path.split fs.separator
    first = parts[0]
    rest = ( parts.slice 1 ).join fs.separator
    if first == "" or first == "."
      @getFileWithPath rest
    else if first == ".."
      @parent?.getFileWithPath rest
    else
      file = @getFileWithName first
      if file?
        if file instanceof SymbolicLink
          file = file.destination()    
        if file instanceof Directory
          file.getFileWithPath rest
        else
          if rest.length == 0
            file
          else
            null
      else
        null

  path: ->
    parentPath = if @parent? then @parent.path() else ""
    fs.join parentPath, @name

  _dataToFile: ( name, data ) ->
    if typeof data == "string"
      if data.substr( 0, 3 ) == "-> "
        new SymbolicLink name, @, data.substr 3
      else
        new TextFile name, @, data
    else
      new Directory name, @, data
