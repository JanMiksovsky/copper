###
Generic "file" viewing window used for all files other than DUP files.
###

class window.FileViewerPage extends Page

  inherited:
    content: [
      html: "pre", ref: "FileViewerPage_content"
    ]
    title: "View File"

  content: Control.chain "$FileViewerPage_content", "content"

  initialize: ->
    # Extract the contents of the file passed to this window via cookie.
    path = @urlParameters().path
    if path?
      @open path

  open: ( path ) ->
    content = Cookie.get path
    @content content if content?