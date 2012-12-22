###
A text area for editing a DUP program.
###

class window.DupProgram extends Control

  inherited:
    content: [
      html: "<div>&nbsp;</div>", ref: "highlight"
    ,
      html: "<textarea spellcheck='false'/>", ref: "programText"
    ]

  content: Control.chain "$programText", "content"

  # highlightPosition:

  highlightVisible: Control.chain "$highlight", "visibility"
