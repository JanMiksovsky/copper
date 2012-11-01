class window.Comment extends CommentItem

  inherited:
    content: [
      control: Link, ref: "linkUser"
    ,
      " "
    ,
      html: "span", ref: "Comment_content"
    ]

  content: Control.chain "$Comment_content", "content"

  user: ( user ) ->
    result = super user
    if user isnt undefined
      @$linkUser().properties
        content: user.name
        href: user.link
    return result