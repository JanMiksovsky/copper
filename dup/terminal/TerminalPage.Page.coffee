class window.TerminalPage extends Page

  inherited:
    title: "Copper Terminal"
    content: [
      { control: "Terminal", ref: "terminal" }
    ]

  initialize: ->
    userName = Page.urlParameters().user
    login userName

  clear: Control.chain "$terminal", "clear"
  prompt: Control.chain "$terminal", "prompt"
  readln: Control.chain "$terminal", "readln"
  terminal: Control.chain "$terminal", "control"
  write: Control.chain "terminal", "write"
  writeln: Control.chain "terminal", "writeln"