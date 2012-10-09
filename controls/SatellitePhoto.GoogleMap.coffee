###
Fake satellite photo with Google Maps
###

class window.SatellitePhoto extends Control

  inherited:
    content: [
      { control: "GoogleMap", ref: "map", mapTypeId: google.maps.MapTypeId.SATELLITE }
      { html: "div", ref: "caption" }
    ]

  initialize: ->
    @$caption().content """
      DUP Panopticon satellite capture<br/>
      #{new Date()}
    """
    @map().setOptions
      draggable: false
      streetViewControl: false
      tilt: 0
      zoomControl: false
    @$map().address "300 110th Ave NE # 105, Bellevue, WA"

  map: Control.chain "$map", "map"