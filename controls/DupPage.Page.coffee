class window.DupPage extends Page

  inherited:
    title: "Dept. of Unified Protection"
    content: [
      { html: "div", ref: "header", content: [
        { html: "div", ref: "titleElements", class: "container", content: [
          { html: "<img src='/copper/dup/resources/dupLogo.png'/>", ref: "logo" }
          { html: "h1", ref: "DupPage_title" }
        ]}
      ]}
      { html: "div", ref: "contentContainer", class: "container", content: [
        { html: "div", ref: "DupPage_content" }
      ]}
    ]

  accessToken: ->
    Page.urlParameters().access_token

  applicationId: ->
    Page.urlParameters().applicationId

  content: Control.chain "$DupPage_content", "content"
  header: Control.chain "$DupPage_header", "content"

  title: ( title ) ->
    result = super title
    if title isnt undefined
      @$DupPage_title().content title
    result