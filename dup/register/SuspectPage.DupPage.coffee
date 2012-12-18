class window.SuspectPage extends DupPage

  inherited:
    content: [
      "<h2>Your Security Begins with Cooperation</h2>"
      """<p>
      Please identify one of the following:
      </p>"""
      { control: "SuspectList", ref: "suspectList" }
      { html: "p", content: [
        "If you do not recognize any of the individuals shown, you may request to "
        { control: Link, ref: "linkReload", content: "view more photos" }
        "."
      ]}
      { html: "p", content: [
        """
        It is imperative that you identify at least one individual you know so
        that we may carry out our mission to keep our nation secure. If you
        abstain from making a selection, your failure to comply may subject you,
        your family, and your associates to investigation and/or indefinite
        incarceration.
        """
      ]}
    ]
    title: "Do you know any of these people?"

  initialize: ->
    @$linkReload().click => @$suspectList().reload()
    @$suspectList().on "selectSuspect", ( event, suspect ) =>
      @next suspect

  next: ( suspect ) ->
    @sendIntroMessage()
    url = "thankYou.html"
    params = if suspect?
      url += "?suspectId=#{suspect.id}"
    window.location = url

  sendIntroMessage: ->
    Facebook.currentUser ( user ) =>
      email = user.email
      if email?
        url = "#{window.location.origin}/email/intro/#{email}"
        $.post url, null, ( data ) =>
          # TODO: If message was NOT sent, need some way for user to resend?
          # Do they have to complete registration again?