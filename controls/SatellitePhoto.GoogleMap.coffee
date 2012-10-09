###
Fake satellite photo with Google Maps
###

class window.SatellitePhoto extends GoogleMap

  inherited:
    mapTypeId: google.maps.MapTypeId.SATELLITE

  initialize: ->
    @map().setOptions
      draggable: false
      streetViewControl: false
      tilt: 0
      zoomControl: false
    @address "300 110th Ave NE # 105, Bellevue, WA"