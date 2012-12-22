###
Renders a QR code in an img element.
###

class window.QrCode extends Control

  content: Control.property()

  initialize: ->
    qr.image
      image: @[0] # img element
      value: @content()

  tag: "img"