class window.ThankYouPage extends DupPage

  inherited:
    title: "Your cooperation has been noted"
    content: [
      """
      <h2>Citizen Watch Report Submitted</h2>
      <p>
      The nationwide Citizen Watch Program assists the Department of Unified
      Protection in identifying citizens of interest to security investigations.
      All citizens are periodically required to review photographs of suspicious
      individuals and indicate any associations with individuals they know.
      </p>
      <p>
      We have updated your citizen profile to note your association with this
      individual:
      </p>
      """
    ,
      control: "SuspectTile", ref: "suspectTile"
    ,
      """
      <p>
      Our agents will use that information to better monitor your activities so
      we can keep you safe. If an agent contacts you with questions in the
      future, it is essential that you continue to cooperate with them.
      </p>
      <h2>Suspicion Breeds Confidence</h2>
      <p>Always report suspicious activity to local law enforcement.</p>
      """
    ]

  initialize: ->
    suspectId = @urlParameters().suspectId
    if suspectId?
      @$suspectTile().suspect
        id: suspectId
        picture: Facebook.pictureUrlForUser suspectId