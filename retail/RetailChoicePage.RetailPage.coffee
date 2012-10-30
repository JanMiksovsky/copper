class window.RetailChoicePage extends RetailPage

  inherited:
    content: [
      """
      <h1>Karmic Moment: Keep or Share?</h1>
      <p>
      <b>You have a decision to make. </b> This store is friendly to the
      conduit resistance, and offers resistance members a discount on
      meals. But first, you have to decide whether you want to share that
      discount with a friend or a stranger.
      </p>
      """
    ,
      html: "<p>", ref: "choices", content: [
        control: BasicButton, ref: "buttonKeep", content: "Keep it all"
      ,
        control: BasicButton, ref: "buttonShare", content: "Share"
      ]
    ]

  initialize: ->
    @$buttonKeep().click => window.location = "couponKeep.html"
    @$buttonShare().click => window.location = "couponShare.html"
