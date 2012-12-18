class window.DupPage extends CopperPage

  inherited:
    title: "Dept. of Unified Protection"
    content: [
      html: "div", ref: "header", content:
        html: "div", ref: "titleElements", class: "container", content: [
          html: "<a href='index.html'>", content:
           html: "<img src='resources/dupLogo.png'/>", ref: "logo"
        ,
          html: "h3", ref: "organization", content: "Department of Unified Protection"
        ,
          html: "h1", ref: "DupPage_title"
        ,
          control: "NavigationBar", ref: "navigationBar"
        ]
    ,
      html: "div", ref: "contentContainer", class: "container", content: [
        html: "div", ref: "DupPage_content"
      ]
    ]

  content: Control.chain "$DupPage_content", "content"

  header: Control.chain "$DupPage_header", "content"

  title: ( title ) ->
    result = super title
    if title isnt undefined
      @$DupPage_title().content title
      # Don't duplicate title
      duplicate = ( title == @$organization().content() )
      @$organization().css "visibility", if duplicate then "hidden" else "visible"
    result