class window.File

  constructor: ( @name, @parent, @contents ) ->

  path: ->
    parentPath = if @parent? then @parent.path() else ""
    fs.join parentPath, @name
