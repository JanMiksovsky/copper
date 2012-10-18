class window.FieldWithNotice extends Control

  inherited:
    content: [
      control: "Notice", ref: "FieldWithNotice_notice", toggle: false
    ,
      html: "div", ref: "FieldWithNotice_content"
    ]

  content: Control.chain "$FieldWithNotice_content", "content"
  notice: Control.chain "$FieldWithNotice_notice", "content"
  toggleNotice: Control.chain "$FieldWithNotice_notice", "toggle"