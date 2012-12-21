###
A full-page modal editor for a file within the DUP terminal.

This is the type of window opened by the "open" command. The open command
determines exactly which editor will be used within the dialog.
###

class window.EditFileDialog extends Dialog

  inherited:
    cancelOnEscapeKey: false
    cancelOnOutsideClick: false
    cancelOnWindowBlur: false
    cancelOnWindowResize: false
    cancelOnWindowScroll: false
    content:
      html: "<div>", ref: "editor"
    generic: false

  editorClass: Control.property.class ( editorClass ) ->
    $new = @$editor().transmute editorClass, true
    @referencedElement "editor", $new

  editorContent: Control.chain "$editor", "content"

  initialize: ->
    @on
      close: => @close()
      save: => @save()

  # The file being edited.
  file: ->
    fs.root.getFileWithPath @path()

  # The path of the file being edited.
  # Setting this loads the file's contents.
  path: Control.property ( path ) ->
    @editorContent @file()?.contents

  # Let CSS do the positioning.
  positionPopup: ->

  # Save back to the path used to open this file.
  save: ->
    @file()?.contents = @editorContent()
