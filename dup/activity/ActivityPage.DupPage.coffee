class window.ActivityPage extends DupPage

  inherited:
    content: [
      "<h2>Activity Map</h2>"
    ,
      control: "GoogleMap", ref: "map", zoom: 12
    ]
    title: "Bio-Terrorist Activity in Your Area"

  initialize: ->
    address = Cookie.get "address"
    @$map().address address if address?