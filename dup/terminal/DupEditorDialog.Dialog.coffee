class window.DupEditorDialog extends Dialog

  inherited:
    cancelOnEscapeKey: false
    cancelOnOutsideClick: false
    cancelOnWindowBlur: false
    cancelOnWindowResize: false
    cancelOnWindowScroll: false
    content: [
      control: DupEditor
      ref: "editor"
      customMenus: [
        control: Menu, content: "File", popup: [
          control: MenuItem, ref: "fileSaveMenuItem", content: "Save"
        ,
          control: MenuItem, ref: "fileCloseMenuItem", content: "Close"
        ]
      ]
    generic: false

  content: Control.chain "$editor", "content"

  initialize: ->
    @$fileSaveMenuItem().click => @save()
    @$fileCloseMenuItem().click => @close()
    # Extract the contents of the file passed to this window via cookie.
    path = @urlParameters().path
    if path?
      @path path

  path: Control.property ( path ) ->
    content = Cookie.get path
    @content content if content?

  # Let CSS do the positioning.
  positionPopup: ->

  # Save back to the path used to open this file.
  save: ->
    file = fs.root.getFileWithPath @path()
    if file?
      file.contents = @content()
    ]
