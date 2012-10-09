class window.SatellitePage extends Control

  inherited:
    content:
      control: GoogleMap
      ref: "map"
      mapTypeId: google.maps.MapTypeId.SATELLITE

  initialize: ->
    @map().setOptions
      draggable: false
      streetViewControl: false
      tilt: 0
      zoomControl: false

  map: Control.chain "$map", "map"