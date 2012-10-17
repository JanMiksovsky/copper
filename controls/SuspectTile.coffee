class window.SuspectTile extends Control

  inherited:
    content: [
      { html: "img", ref: "picture" }
      { html: "div", ref: "name" }
    ]

  name: Control.chain "$name", "content"
  picture: Control.chain "$picture", "prop/src"

  suspect: Control.property ( suspect ) ->
    @name suspect.name
    @picture suspect.picture