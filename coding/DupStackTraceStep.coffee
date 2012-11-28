###
A single step in a DUP stack trace
###

class window.DupStackTraceStep extends Control

  inherited:
    content: [
      html: "<span>", ref: "stack"
    ,
      " "
    ,
      html: "<span>", ref: "op"
    ]

  op: Control.chain "$op", "content"

  stack: Control.property ( stack ) ->
    @$stack().content stack.join " "
