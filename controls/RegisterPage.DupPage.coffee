class window.RegisterPage extends DupPage

  inherited:
    content: [
      "<p>Thank you for agreeing to participate in compulsory citizen registration.</p>"
      "<h2>Provide Your Personal Information</h2>"
      """<p>
      Your responses may be verified against information we have obtained from
      other, confidential sources. If you believe those sources are in error,
      you have the right to file an appeal and appear before a Department of
      Unified Protection information verification tribunal.
      </p>"""
    ,
      html: "div", content: [
        "<div class='label'>Your name</div>"
      ,
        control: TextBox, ref: "name"
      ]
    ,
      html: "div", content: [
        "<div class='label'>Date of birth</div>"
      ,
        control: DateComboBox, ref: "birthday"
      ]
    ,
      html: "div", content: [
        "<div class='label'>Primary residence address where we can find you</div>"
      ,
        html: "<textarea>", ref: "address"
      ]
    ,
      html: "div", content: [
        "<div class='label'>Preferred email address if we have questions</div>"
      ,
        control: TextBox, ref: "email"
      ]
    ,
      html: "div", content: [
        "<div class='label'>Do you believe you have paranormal abilities?</div>"
        { control: RadioButton, content: "Yes" }
        { control: RadioButton, content: "No" }
      ]
    ,
      html: "div", content: [
        "<div class='label'>Have you witnessed individuals with paranormal abilities?</div>"
      ,
        control: RadioButton, content: "Yes"
      ,
        control: RadioButton, content: "No"
      ]
    ,
      html: "p", content: [
        control: BasicButton, ref: "submitButton", content: "Submit", disabled: true
      ]
    ]
    title: "Compulsory Citizen Registation"

  birthday: Control.chain "$birthday", "date"

  currentUser: Control.property ->
    @$submitButton().disabled false

  initialize: ->
    Facebook.currentUser ( user ) => @currentUser user
    @$submitButton().click => @navigateWithAccessToken "referral.html"

  validate: ->
    fbBirthday = new Date Date.parse @currentUser().birthday
