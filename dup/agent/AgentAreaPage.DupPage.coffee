class window.AgentAreaPage extends DupPage

  inherited:
    content: [
      """
      <p>
      This area is reserved for authorized D.U.P. agents and contractors.
      Use by unauthorized persons will be prosecuted to the maximum extent of
      the Bio-Terrorist Crisis Security Act.
      </p>
      """
    ,
      html: "<ul>", content: [
        html: "<li>", content: [
          control: Link, content: "Profile Management", href: "signin.html"
        ]
      ,
        html: "<li>", content: [
          control: Link, content: "Agent Terminal", href: "terminal.html"
        ]
      ]
    ]
    title: "Agent Support Area"