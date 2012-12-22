###
A post in a fake Facebook timeline.
###

class window.TimelinePost extends TimelineUnit

  inherited:
    content: [
      html: "div", ref: "byline", class: "clearfix", content: [
        html: "<img src='resources/profilePhoto.jpg'/>", ref: "profilePhoto"
      ,
        html: "div", ref: "authorBlock", content: [
          control: Link, ref: "TimelinePost_author"
        ,
          html: "div", ref: "TimelinePost_date"
        ]
      ]
    ,
      html: "div", ref: "TimelinePost_content"
    ,
      html: "div", ref: "likeBlock", content: [
        control: Link, content: "Like"
      ,
        " · "
      ,
        control: Link, content: "Comment"
      ]
    ,
      control: "List", ref: "commentList", itemClass: "Comment"
    ,
      control: "CommentComposer", ref: "commentComposer"
    ]

  addComment: ( comment ) ->
    @comments @comments().concat comment

  author: Control.chain "$TimelinePost_author", "content"
  authorPage: Control.chain "$TimelinePost_author", "href"
  comments: Control.chain "$commentList", "items"
  content: Control.chain "$TimelinePost_content", "content"
  date: Control.chain "$TimelinePost_date", "content"

  initialize: ->
    @$commentComposer().on "saveComment", ( event, comment ) =>
      @addComment comment
      @$commentComposer().content ""
      response = ChatterBot.respond comment.content
      setTimeout =>
        @addComment
          user: fakeFacebookUsers.heroine
          content: response
      , 1000
