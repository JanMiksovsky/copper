class window.SuspectTile extends Control

  inherited:
    content: [
      { html: "img", ref: "picture" }
      { html: "div", ref: "data", content: [
        { html: "div", ref: "identifier" }
        { html: "div", ref: "timestamp" }
      ]}
    ]

  initialize: ->
    # Choose a random identifier.
    identifier = Math.floor Math.random() * 1000000000000000
    @$identifier().content identifier

  picture: Control.chain "$picture", "prop/src"

  suspect: Control.property ( suspect ) ->
    @picture suspect.picture