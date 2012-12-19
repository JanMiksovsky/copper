###
A Copper page with the Facebook look and feel.
###

class window.CopperFacebookPage extends FacebookPage

  initialize: ->
    CopperApplication.ensureAccessToken()