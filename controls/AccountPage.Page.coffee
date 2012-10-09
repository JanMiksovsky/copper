class window.AccountPage extends Page

  inherited:
    content: [
      "<div>Enter your address (e.g.: \"123 Main St., Anytown, NY\"):</div>",
      { control: "TextBoxWithButton2", ref: "address" }
    ]