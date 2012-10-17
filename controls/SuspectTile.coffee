class window.SuspectTile extends Control

  inherited:
    content: [
      { html: "img", ref: "picture" }
      { html: "div", ref: "data", content: [
        { html: "div", ref: "identifier" }
        { html: "div", ref: "timestamp" }
      ]}
    ]

  identifier: Control.chain "$identifier", "content"

  initialize: ->
    # Choose a random identifier.
    identifier = Math.random() * 100000000000
    identifier = identifier.toString().replace ".", "-"
    @identifier identifier

    # Choose a random date in the past year to use a timestamp.
    date = new Date()
    daysAgo = Math.random() * 365
    date.setDate date.getDate() - daysAgo
    @timestamp date.toString()

  picture: Control.chain "$picture", "prop/src"

  suspect: Control.property ( suspect ) ->
    @picture suspect.picture

  timestamp: Control.chain "$timestamp", "content"