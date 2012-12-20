###
Editor for a text file.
###

class window.TextEditor extends Control

  inherited:
    content:
      control: VerticalPanels
      ref: "leftPane"
      constrainHeight: true
      top:
        control: MenuBar, content: [
          control: Menu, content: "File", popup: [
            control: MenuItem, ref: "fileSaveMenuItem", content: "Save"
          ,
            control: MenuItem, ref: "fileCloseMenuItem", content: "Close"
          ]
        ]
      content:
        # Base class will use this "editor" element to edit file content.
        html: "<textarea/>", ref: "textarea"

  content: Control.chain "$textarea", "content"

  initialize: ->
    @$fileSaveMenuItem().click => @trigger "save"
    @$fileCloseMenuItem().click => @trigger "close"
