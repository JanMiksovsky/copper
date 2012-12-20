###
Generic "file" viewing window used for all files other than DUP files.
###

class window.FileViewer extends Page

  inherited:
    content: [
      html: "pre", ref: "FileViewer_content"
    ]
    title: "View File"

  content: Control.chain "$FileViewer_content", "content"

  initialize: ->
    # Extract the contents of the file passed to this window via cookie.
    path = @urlParameters().path
    if path?
      @open path

  open: ( path ) ->
    content = Cookie.get path
    @content content if content?
