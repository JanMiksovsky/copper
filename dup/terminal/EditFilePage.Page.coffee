###
Generic "file" editing window used for all files other than DUP files.
###

class window.EditFilePage extends Page

  inherited:
    content: [
      html: "pre", ref: "EditFilePage_content"
    ]
    title: "Edit File"

  content: Control.chain "$EditFilePage_content", "content"

  initialize: ->
    # Extract the contents of the file passed to this window via cookie.
    path = @urlParameters().path
    if path?
      @open path

  open: ( path ) ->
    content = Cookie.get path
    @content content if content?
    # Cookie.delete "fileContents"
