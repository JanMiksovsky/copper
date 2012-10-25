###
A Google map.
###

class window.GoogleMap extends Control

  address: ( address ) ->
    geocoder = new google.maps.Geocoder()
    geocoder.geocode { address }, ( data ) =>
      [ results, status ] = data
      if not status? or status == "OK"
        result = if results.length > 0 then results[0] else results
        @center result.geometry.location

  inherited:
    content:
      { html: "div", ref: "canvas" }

  initialize: ->
    # Create map
    canvas = this.$canvas()[0]
    options =
      zoom: 18
      mapTypeControl: false
      navigationControlOptions:
        style: google.maps.NavigationControlStyle.SMALL
      mapTypeId: @mapTypeId()
    map = new google.maps.Map canvas, options
    @map map # Save reference for later
    if not @mapTypeId()?
      @mapTypeId google.maps.MapTypeId.ROADMAP

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

  mapTypeId: Control.property ( mapTypeId ) ->
    @map()?.setMapTypeId mapTypeId

  _unsupported: ->
    # TODO
    # this.content "Map features are not supported on your browser"
