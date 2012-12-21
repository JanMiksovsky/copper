###
A DUP program editor extended with some file commands for integration with the
DUP terminal.

The file features are factored out of the core DUP editor so that that editor
may be deployed at a site (e.g., duplang.org) that doesn't have the context of
the DUP terminal.
###

class window.DupFileEditor extends Control

  inherited:
    content: [
      control: "DupEditor"
      ref: "editor"
      customMenus: [
        control: Menu, content: "File", popup: [
          control: MenuItem, ref: "fileSaveMenuItem", content: "Save"
        ,
          control: MenuItem, ref: "fileCloseMenuItem", content: "Close"
        ]
      ]
    ]

  content: Control.chain "$editor", "content"

  initialize: ->
    @$fileSaveMenuItem().click => @trigger "save"
    @$fileCloseMenuItem().click => @trigger "close"
