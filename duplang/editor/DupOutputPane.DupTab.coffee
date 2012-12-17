class window.DupOutputPane extends DupTab

  inherited:
    content:
      control: "Log", ref: "log"
    description: "Output"

  clear: Control.chain "$log", "clear"
  write: Control.chain "$log", "write"