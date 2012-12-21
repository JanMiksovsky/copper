class window.AgentProfilePage extends DupPage

  inherited:
    content: [
      html: "<div>", class: "table", content: [
        html: "<div>", content: [
          "<div>Mobile phone number:&nbsp;</div>"
        ,
          html: "<input type='text'/>", ref: "textBoxPhone"
        ]
      ,
        "<div>&nbsp;</div>"
      ,
        html: "<div>", content: [
          "<div/>"
        ,
          control: BasicButton, ref: "submitButton", content: "Submit"
        ]
      ]
    ,
      """
      <p>
      Your new employee training materials have been prepared. Please use the
      following Cloud Print document retrieval code: 1234657.
      </p>
      """
    ]
    title: "Update Your Agent Profile"

  initialize: ->
    @$submitButton().click =>
      window.location = "agent.html"