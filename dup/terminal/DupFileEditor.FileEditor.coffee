###
Host the DUP editor in a modal window that fills the page.
###

class window.DupFileEditor extends FileEditor

  inherited:
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
    ]

  initialize: ->
    @$fileSaveMenuItem().click => @save()
    @$fileCloseMenuItem().click => @close()
