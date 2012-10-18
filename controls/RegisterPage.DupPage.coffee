class window.RegisterPage extends DupPage

  inherited:
    content: [
      """
      <p>Thank you for agreeing to participate in compulsory citizen registration.</p>
      <h2>Complete Your Citizen Record</h2>
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
        control: ValidatingTextBox
        ref: "name"
        generic: false
        required: true
      ]
    ,
      html: "div", content: [
        "<div class='label'>Social Security Number</div>"
      ,
        control: TextBox, content: "[On File]", disabled: true
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
    @$submitButton().click ( event )=>
      # TODO: Remove ability to skip validation by holding down CTRL.
      valid = event.ctrlKey or @valid()
      if valid
        @navigateWithAccessToken "referral.html"

  name: Control.chain "$name", "content"

  requiredFieldsComplete: ->
    @$name().valid() and @birthday()? and @haveParanormal()? and @witnessedParanormal()?

  valid: ->

    requiredFieldsComplete = @requiredFieldsComplete()
    @$requiredNotice().toggle !requiredFieldsComplete
    unless requiredFieldsComplete
      return

    validBirthday = @validBirthday()
    @$fieldBirthday().toggleNotice !validBirthday

    validBirthday

  # User birthday must match their birthday in Facebook.
  validBirthday: ->
    birthday = @birthday()
    fbBirthday = new Date Date.parse @currentUser().birthday
    birthday.getFullYear() == fbBirthday.getFullYear() \
      and birthday.getMonth() == fbBirthday.getMonth() \
      and birthday.getDate() == fbBirthday.getDate()

  witnessedParanormal: ->
    @_yesNoGroupValue "witnessedParanormal"

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