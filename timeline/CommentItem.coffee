###
A comment in a fake Facebook post.
###

class window.CommentItem extends Control

  inherited:
    content: [
      control: HorizontalPanels
      left:
        html: "img", ref: "picture"
      content:
        html: "div", ref: "CommentItem_content"
    ]

  content: Control.chain "$CommentItem_content", "content"

  user: Control.property ( user ) ->
    @$picture().prop "src", Facebook.pictureUrlForUser user, 32