class window.ActivityPage extends DupPage

  inherited:
    content: [
      control: Modes
      ref: "modes"
      content: [
        html: "p", ref: "modeUnregistered", content: """
          Please <a href='register.html'>register</a> to see local activity.
        """
      ,
        html: "div", ref: "modeRegistered", content: [
          "<h2>Activity Map</h2>"
        ,
          control: "GoogleMap", ref: "map", zoom: 12
        ,
          """
          <h2>Suspicious Persons List</h2>
          <p>
          Please notify Department of Unified Protection agents if you see
          the following individuals or are aware of their location. Do not
          approach them or offer them assistance.
          </p>
          """
        ,
          control: "SuspiciousPersonsList"
        ]
      ]
    ]
    title: "Bio-Terrorist Activity in Your Area"

  initialize: ->
    address = Cookie.get "address"
    if address?
      @$map().address address
      @$modes().activeElement @$modeRegistered()
