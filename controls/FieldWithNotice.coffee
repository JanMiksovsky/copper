class window.FieldWithNotice extends Control

  inherited:
    content: [
      html: "div", ref: "FieldWithNotice_content"
    ,
      control: "Notice", ref: "FieldWithNotice_notice", toggle: false
    ]
    generic: true

  content: Control.chain "$FieldWithNotice_content", "content"
  notice: Control.chain "$FieldWithNotice_notice", "content"
  toggleNotice: Control.chain "$FieldWithNotice_notice", "toggle"