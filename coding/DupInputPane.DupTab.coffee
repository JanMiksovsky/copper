class window.DupInputPane extends DupTab

  inherited:
    content:
      control: "TextBoxStream", ref: "DupInputPane_content"
    description: "Input"

  content: Control.chain "$DupInputPane_content", "content"
  position: Control.chain "$DupInputPane_content", "position"
  read: Control.chain "$DupInputPane_content", "read"