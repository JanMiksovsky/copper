class window.DupInputPane extends DupTab

  inherited:
    content:
      html: "<textarea>", ref: "DupInputPane_content"
    description: "Input"

  content: Control.chain "$DupInputPane_content", "content"