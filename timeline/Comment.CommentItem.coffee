###
A comment on a fake Facebook post.
###

class window.Comment extends CommentItem

  inherited:
    content: [
      html: "div", content: [
        control: Link, ref: "linkUser"
      ,
        " "
      ,
        html: "span", ref: "Comment_content"
      ]
    ,
      html: "div", ref: "commentLikeBlock", content: [
        control: Link, content: "Like"
      ]
    ]

  content: Control.chain "$Comment_content", "content"

  user: ( user ) ->
    result = super user
    if user isnt undefined
      Facebook.profileForUser user, ( profile ) =>
        @$linkUser().properties
          content: profile.name
          href: profile.link
    return result