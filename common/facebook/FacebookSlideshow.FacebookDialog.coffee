###
A simulation of the Facebook photo slideshow UI.
###

class window.FacebookSlideshow extends FacebookDialog

  inherited:
    content:
      control: HorizontalPanels
      content:
        html: "div", ref: "FacebookSlideshow_content"
      right:
        html: "div", ref: "rightPane", content: "Hello, world"
    visibility: false

  content: Control.chain "$FacebookSlideshow_content", "content"
  
  initialize: ->
    @$photo().load =>
      @visibility true
