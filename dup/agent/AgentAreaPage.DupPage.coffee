###
The main page for the agents-only area on the DUP site.
###

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
    ,
      """
      <p>
      Agents requiring tactical assistance or other support should contact the
      DUP Agent Support Center at +1 (615) 692-1014.
      </p>
      """
    ]
    title: "Agent Support Area"