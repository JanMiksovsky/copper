class window.SatellitePage extends Control

  inherited:
    content:
      { control: "SatellitePhoto", ref: "photo" }

  initialize: ->

    urlParameters = Page.urlParameters()
    address = urlParameters.address ? "500 108th Avenue NE # 200, Bellevue, WA"
    address = address.replace /%20/g, " "
    @address address

    zoom = urlParameters.zoom
    if zoom?
      @zoom parseInt zoom

    # Don't show photo until we've decoded the address and found the nearby business.
    google.maps.event.addListener @$photo().map(), "center_changed", =>
      @$photo().css "visibility", "visible"

  address: ( address ) ->
    geocoder = new google.maps.Geocoder()
    geocoder.geocode { address }, ( data ) =>
      [ results, status ] = data
      # TODO: Check status
      # if not status? or status == "OK"
      result = if results.length > 0 then results[0] else results
      @location result.geometry.location

  location: ( location ) ->
    map = @map()
    placesService = new google.maps.places.PlacesService map
    request =
      keyword: "Subway"
      location: location
      rankBy: google.maps.places.RankBy.DISTANCE
    placesService.search request, ( results ) =>
      if results?.length > 0
        result = results[0]
        map.setCenter result.geometry.location

  map: Control.chain "$photo", "map"

  zoom: ( zoom ) ->
    if zoom is undefined
      return @map().getZoom()
    else
      @map().setZoom zoom
      @