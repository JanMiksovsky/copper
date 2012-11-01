class window.CommentComposer extends CommentItem

  inherited:
    content:
      control: AutoSizeTextBox, placeholder: "Write a comment..."

  initialize: ->
    @user "me"