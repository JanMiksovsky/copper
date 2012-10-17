class window.SuspectTile extends Control

  inherited:
    content:
      { html: "img", ref: "picture" }

  picture: Control.chain "$picture", "prop/src"

  user: Control.property ( user ) ->
    @picture Facebook.pictureUrlForUser user