class window.DupPage extends Page

  inherited:
    title: "Dept. of Unified Protection"
    content: [
      { html: "div", ref: "header", content: [
        { html: "<img src='/copper/dup/resources/dupLogo.png'/>", ref: "logo" }
        { html: "h1", ref: "DupPage_title" }
      ]}
      { html: "div", ref: "DupPage_content" }
    ]

  content: Control.chain "$DupPage_content", "content"
  header: Control.chain "$DupPage_header", "content"

  title: ( title ) ->
    result = super title
    if title isnt undefined
      @$DupPage_title().content title
    result