###
A comment-composing area in a fake Facebook post.
###

class window.CommentComposer extends CommentItem

  inherited:
    content:
      control: AutoSizeTextBox, ref: "commentTextBox", placeholder: "Write a comment..."

  # Return the current state of the comment.
  comment: ->
    {
      user: @user()
      content: @content()
    }
    
  content: Control.chain "$commentTextBox", "content"

  initialize: ->
    Facebook.currentUser ( user ) =>
      @user user
    @$commentTextBox().keydown ( event ) =>
      if event.which == 13 # Enter
        if @content()?.length > 0
          @trigger "saveComment", [ @comment() ]
        false