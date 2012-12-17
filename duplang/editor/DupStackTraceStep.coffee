###
A single step in a DUP stack trace
###

class window.DupStackTraceStep extends Control

  inherited:
    content: [
      html: "<td>", ref: "stack"
    ,
      html: "<td>&nbsp;&nbsp;</td>"
    ,
      html: "<td>", ref: "before"
    ,
      html: "<td>", ref: "op"
    ,
      html: "<td>", ref: "after"
    ]

  after: Control.chain "$after", "content"

  before: Control.chain "$before", "content"

  op: Control.chain "$op", "content"

  stack: Control.property ( stack ) ->
    @$stack().content stack.join " "

  tag: "tr"