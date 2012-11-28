###
A single step in a DUP stack trace
###

class window.DupStackTraceStep extends Control

  inherited:
    content: [
      html: "<td>", content: [
        html: "<span>", ref: "before"
      ,
        "---"
      ,
        html: "<span>", ref: "after"
      ]
    ,
      html: "<td>", content: [
        " "
      ,
        html: "<span>", ref: "stack"
      ,
        " "
      ,
        html: "<span>", ref: "op"
      ]
    ]

  after: Control.chain "$after", "content"
  before: Control.chain "$before", "content"
  op: Control.chain "$op", "content"

  stack: Control.property ( stack ) ->
    @$stack().content stack.join " "

  tag: "tr"