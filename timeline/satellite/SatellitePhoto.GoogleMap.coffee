###
Fake satellite photo with Google Maps
###

class window.SatellitePhoto extends Control

  inherited:
    content: [
      control: "GoogleMap", ref: "map"
    ,
      html: "div", ref: "caption"
    ,
      html: "<img src='resources/circle.png'/>", ref: "circle", class: "markings"
    ,
      html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs1", class: "markings"
    ,
      html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs2", class: "markings"
    ,
      html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs3", class: "markings"
    ,
      html: "<img src='resources/crosshairs.png'/>", ref: "crosshairs4", class: "markings"
    ]

  initialize: ->
    @$caption().content """
      DUP Panopticon satellite capture<br/>
      #{new Date()}
    """
    @$map().mapTypeId google.maps.MapTypeId.SATELLITE

    # Use the map's current zoom level as the min and max zoom level to
    # effectively disable various types of zooming (wheel, keyboard, etc).
    zoomLevel = @map().getZoom()

    @map().setOptions
      draggable: false
      streetViewControl: false
      tilt: 0
      minZoom: zoomLevel
      maxZoom: zoomLevel
      zoomControl: false

  map: Control.chain "$map", "map"