class window.SatellitePage extends Control

  inherited:
    content:
      control: "SatellitePhoto"
      ref: "photo"

  initialize: ->
    map = @$photo().map()
    placesService = new google.maps.places.PlacesService map
    request =
      keyword: "Subway"
      location: map.getCenter()
      rankBy: google.maps.places.RankBy.DISTANCE
    placesService.search request, ( results ) =>
      if results?.length > 0
        result = results[0]
        map.setCenter result.geometry.location