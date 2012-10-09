###
A Google map.
###

class window.GoogleMap extends Control

  inherited:
    content:
      { html: "div", ref: "canvas" }

  initialize: ->
    # Create map
    canvas = this.$canvas()[0]
    options =
      center: ( new google.maps.LatLng 47.61504, -122.19617 )
      zoom: 18
      mapTypeControl: false
      navigationControlOptions:
        style: google.maps.NavigationControlStyle.SMALL
      mapTypeId: @mapTypeId()
    map = new google.maps.Map canvas, options
    @map map # Save reference for later

    # google.maps.event.addListener map, "click", ( event ) =>
    #   @trigger "mapClick", event.latLng

  center: ( latLng ) ->
    if latLng is undefined
      @map().getCenter()
    else
      @map().setCenter latLng
      @

  # The current Google Map
  map: Control.property()

  mapTypeId: Control.property( ( mapTypeId ) ->
    @map()?.setMapTypeId mapTypeId
  , google.maps.MapTypeId.ROADMAP )

  _unsupported: ->
    # TODO
    # this.content "Map features are not supported on your browser"
