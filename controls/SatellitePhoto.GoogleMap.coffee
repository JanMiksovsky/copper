###
Fake satellite photo with Google Maps
###

class window.SatellitePhoto extends Control

  inherited:
    content: [
      { control: "GoogleMap", ref: "map", mapTypeId: google.maps.MapTypeId.SATELLITE }      
      { html: "div", ref: "caption" }
      { html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs1", class: "crosshairs" }
      { html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs2", class: "crosshairs" }
      { html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs3", class: "crosshairs" }
      { html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs4", class: "crosshairs" }
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
    @$map().address "1521 41st Ave E, Seattle, WA" # "300 110th Ave NE # 105, Bellevue, WA"

  map: Control.chain "$map", "map"