###
A stack trace of a DUP program execution.
###

class window.DupStackTrace extends Control

  inherited:
    content: [
      html: "<tr>", ref: "heading", content: [
        html: "<td>Stack</td>", ref: "columnHeadingStack"
      ,
        html: "<td>&nbsp;&nbsp;</td>"
      ,
        html: "<td/>"
      ,
        html: "<td>⇣</td>"
      ,
        html: "<td>Current op</td>"
      ]
    ,
      control: List, ref: "stepList", itemClass: "DupStackTraceStep"
    ]

  trace: Control.chain "$stepList", "items"