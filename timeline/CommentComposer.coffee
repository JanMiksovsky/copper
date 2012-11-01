class window.CommentComposer extends Control

  inherited:
    content:
      html: "img", ref: "picture"
      control: AutoSizeTextBox

  initialize: ->
    @$picture().prop "src", Facebook.pictureUrlForUser "me", 32