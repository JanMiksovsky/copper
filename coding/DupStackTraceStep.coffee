class window.DupStackTraceStep extends Control

  inherited:
    content: [
      html: "<span>", ref: "op"
    ,
      html: "<span>", ref: "stack"
    ]

  op: Control.chain "$op", "content"

  stack: Control.property ( stack ) ->
    @$stack().content stack.join " "