###
A full-page modal editor for a file within the DUP terminal.
This is the type of window opened by the "open" command.
###

class window.FileEditor extends Dialog

  inherited:
    cancelOnEscapeKey: false
    cancelOnOutsideClick: false
    cancelOnWindowBlur: false
    cancelOnWindowResize: false
    cancelOnWindowScroll: false
    # Base class uses a textarea to edit.
    content: [
      html: "<textarea/>", ref: "editor"
    ]
    generic: false

  editorContent: Control.chain "$editor", "content"

  # The file being edited.
  file: ->
    fs.root.getFileWithPath @path()

  # The path of the file being edited.
  # Setting this loads the file's contents.
  path: Control.property ( path ) ->
    # @editorContent @file()?.contents

  # Let CSS do the positioning.
  positionPopup: ->

  # Save back to the path used to open this file.
  save: ->
    @file()?.contents = @editorContent()
