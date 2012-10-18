class window.RegisterPage extends DupPage

  inherited:
    content: [
      """
      <p>Thank you for agreeing to participate in compulsory citizen registration.</p>
      <h2>Provide Your Personal Information</h2>
      <p>
      Your responses may be verified against information we have obtained from
      other, confidential sources. If you believe those sources are in error,
      you have the right to file an appeal and appear before a Department of
      Unified Protection information verification tribunal.
      </p>
      """
    ,
      html: "div", content: [
        "<div class='label'>Your name</div>"
      ,
        control: TextBox, ref: "name"
      ]
    ,
      control: "FieldWithNotice"
      ref: "fieldBirthday"
      notice: "This date does not match our records."
      content: [
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
      ,
        control: RadioButton, content: "Yes", name: "haveParanormal"
      ,
        control: RadioButton, content: "No", name: "haveParanormal"
      ]
    ,
      html: "div", content: [
        "<div class='label'>Have you witnessed individuals with paranormal abilities?</div>"
      ,
        control: RadioButton, content: "Yes", name: "witnessedParanormal"
      ,
        control: RadioButton, content: "No", name: "witnessedParanormal"
      ]
    ,
      control: "Notice"
      content: "All fields are required."
      ref: "requiredNotice"
      toggle: false
    ,
      html: "p", content: [
        control: BasicButton, ref: "submitButton", content: "Submit", disabled: true
      ]
    ]
    title: "Compulsory Citizen Registation"

  birthday: Control.chain "$birthday", "date"

  currentUser: Control.property ->
    @$submitButton().disabled false

  haveParanormal: ->
    @_yesNoGroupValue "haveParanormal"

  initialize: ->
    @birthday null
    Facebook.currentUser ( user ) => @currentUser user
    @$submitButton().click =>
      if @valid()
        @navigateWithAccessToken "referral.html"

  valid: ->

    birthday = @birthday()

    allRequiredFields = birthday?
    @$requiredNotice().toggle !allRequiredFields
    unless allRequiredFields
      return

    fbBirthday = new Date Date.parse @currentUser().birthday
    birthdaysMatch = birthday.getFullYear() == fbBirthday.getFullYear() \
      and birthday.getMonth() == fbBirthday.getMonth() \
      and birthday.getDate() == fbBirthday.getDate()
    @$fieldBirthday().toggleNotice !birthdaysMatch

    return birthdaysMatch

  _radioGroupValue: ( groupName ) ->
    checked = $ "input[name=#{groupName}]:checked"
    if checked.length == 0
      return null
    return checked.parent()?.control()?.content()

  _yesNoGroupValue: ( groupName ) ->
    switch @_radioGroupValue groupName
      when "Yes"
        true
      when "No"
        false
      else
        null