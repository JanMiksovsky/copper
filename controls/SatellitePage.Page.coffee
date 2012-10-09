class window.SatellitePage extends Control

  inherited:
    content:
      control: "SatellitePhoto"
      ref: "photo"

  initialize: ->
    # TODO: Use Sucker Punch API key. The following is a quickui.org key.
    apiKey = "AIzaSyBv9uyS4BISNFq3Nqy1nEIacR8rZq9mbKQ"
    latLng = new google.maps.LatLng 47.61504, -122.19617
    lat = latLng.lat()
    lng = latLng.lng()
    radius = 1000
    keyword = "Subway"
    sensor = false
    parameters = "key=#{apiKey}&keyword=#{keyword}&location=#{lat},#{lng}&radius=#{radius}&sensor=#{sensor}"
    url = "https://maps.googleapis.com/maps/api/place/search/json?#{parameters}&callback=?"
    $.getJSON url, ( data ) ->
      debugger