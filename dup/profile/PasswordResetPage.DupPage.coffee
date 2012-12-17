###
Not ready for use yet

class exports.PasswordResetPage extends DupPage

  inherited:
    content: [
      "<div>Enter your new password:</div>",
      { control: "TextBoxWithButton2", ref: "password" }
    ]

  password: Control.chain "$password", "content"

  initialize: ->
    hash = @urlParameters().hash ? "123789"
    hash = hash.slice hash.length - 6
    @validator new PasswordValidator hash
    @$password().find( "input" ).focus()
    @$password().on "goButtonClick", =>
      message = @validator().validate @password()
      alert message

  validator: Control.property()
###