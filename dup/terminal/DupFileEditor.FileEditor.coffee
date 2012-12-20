###
Host the DUP editor in a modal window that fills the page.
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

  initialize: ->
    @$fileSaveMenuItem().click => @trigger "save"
    @$fileCloseMenuItem().click => @trigger "close"
