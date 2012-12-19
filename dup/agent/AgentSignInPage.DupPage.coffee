class window.AgentSignInPage extends DupPage

  inherited:
    content: [
      html: "<div>", class: "table", content: [
        html: "<div>", content: [
          "<div>User ID:&nbsp;</div>"
        ,
          html: "<input type='text'/>", ref: "textBoxUserId"
        ]
      ,
        html: "<div>", content: [
          "<div>Password:&nbsp;</div>"
        ,
          html: "<input type='password'/>", ref: "textBoxPassword"
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
    ]
    title: "Agent identity verification required"

  initialize: ->
    @$submitButton().click =>
      window.location = "agentProfile.html"