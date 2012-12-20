class window.File

  constructor: ( @name, @parent, @contents ) ->

  extension: ->
    parts = @name.split "."
    if parts?.length > 1
      parts[ parts.length - 1 ]
    else
      ""

  path: ->
    parentPath = if @parent? then @parent.path() else ""
    fs.join parentPath, @name
