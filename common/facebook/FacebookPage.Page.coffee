###
A canvas page in a Facebook application.
###

class window.FacebookPage extends Page

  inherited:
    generic: false
    content: [
      html: "div", ref: "globalContainer", content: [
        html: "div", ref: "contentArea", content: [
          html: "div", ref: "FacebookPage_content"
        ]
      ]
    ]

  content: Control.chain "$FacebookPage_content", "content"