###
The background of a Facebook dialog.
###

class window.FacebookOverlay extends Overlay

  initialize: ->
    @on "DOMMouseScroll mousewheel", ( event ) =>
      # Prevent wheel scrolls over overlay from scrolling underlying
      # page, which is sort of disconcerting when a modal dialog
      # is up.
      event.preventDefault();
