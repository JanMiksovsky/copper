class window.RegisterPage extends DupPage

  inherited:
    content: [
      """<p>
      Thank you for agreeing to participate in compulsory citizen registration.
      Please answer all questions truthfully. Your responses will be verified
      against other sources.
      </p>"""
      { control: BasicButton, ref: "submitButton", content: "Submit" }
    ]
    title: "Compulsory Citizen Registation"

  initialize: ->
    @$submitButton().click =>
      window.location = "referral.html?applicationId=#{@applicationId()}&access_token=#{@accessToken()}"