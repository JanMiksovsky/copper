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
    content = Cookie.get "fileContents"
    @content content
    Cookie.delete "fileContents"