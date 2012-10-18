class window.ReferralPage extends DupPage

  inherited:
    content: [
      """<p>
      The nationwide Citizen Watch Program assists the Department of Unified
      Protection in identifying citizens of interest to security investigations.
      All citizens are periodically required to review photographs of suspicious
      individuals and indicate any associations with individuals they know.
      </p>"""
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
        abstain from making a selection, your failure to comply  comply may
        subject you, your family, and your associates to investigation. 
        """
        { control: Link, ref: "linkAbstain", content: "Abstain" }
      ]}
    ]
    title: "Citizen Watch Program"

  initialize: ->
    @$linkReload().click => @$suspectList().reload()
    @$linkAbstain().click =>
      alert "You gain karma by not cooperating."