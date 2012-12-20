###
A DUP program editor that can read/write files from the DUP "file system".
###

class window.DupFileEditor extends DupEditor

  inherited:
    customMenus: [
      control: Menu, content: "File", popup: [
        control: MenuItem, ref: "fileSaveMenuItem", content: "Save"
      ,
        control: MenuItem, ref: "fileCloseMenuItem", content: "Close"
      ]
    ]

  close: ->
    
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

  # Save back to the path used to open this file.
  save: ->
    file = fs.root.getFileWithPath @path()
    if file?
      file.contents = @content()