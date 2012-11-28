class window.DupStackTraceStep extends Control

  inherited:
    content: [
      html: "<td>", ref: "op"
    ,
      html: "<td>", ref: "stack"
    ]

  op: Control.chain "$op", "content"

  stack: Control.property ( stack ) ->
    @$stack().content stack.join " "

  tag: "tr"