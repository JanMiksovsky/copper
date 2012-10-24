class window.FacebookSlideshow extends FacebookDialog

  inherited:
    content:
      control: HorizontalPanels
      content:
        html: "div", ref: "photoContainer", content:
          control: FlickrInterestingPhoto, ref: "photo", photoSize: "z"
      right:
        html: "div", ref: "rightPane", content: "Hello, world"
    visibility: false

  initialize: ->
    @$photo().load =>
      @visibility true
