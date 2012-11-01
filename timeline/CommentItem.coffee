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

  user: ( user ) ->
    @$picture().prop "src", Facebook.pictureUrlForUser user, 32