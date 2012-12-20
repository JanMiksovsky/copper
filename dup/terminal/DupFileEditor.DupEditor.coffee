###
A DUP program editor that can read/write files from the DUP "file system".
###

class window.DupFileEditor extends DupEditor

  initialize: ->
    # Extract the contents of the file passed to this window via cookie.
    path = @urlParameters().path
    if path?
      @open path

  open: ( path ) ->
    content = Cookie.get path
    @content content if content?
