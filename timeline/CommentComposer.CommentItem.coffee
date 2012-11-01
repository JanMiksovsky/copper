class window.CommentComposer extends CommentItem

  inherited:
    content:
      control: AutoSizeTextBox, ref, "commentTextBox", placeholder: "Write a comment..."

  initialize: ->
    @user "me"