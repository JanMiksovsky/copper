class window.FacebookPage extends Page

  inherited: [
    html: "div", ref: "globalContainer", content: [
      html: "div", ref: "contentArea", content: [
        html: "div", ref: "FacebookPage_content"
      ]
    ]
  ]

  content: Control.chain "$FacebookPage_content", "content"