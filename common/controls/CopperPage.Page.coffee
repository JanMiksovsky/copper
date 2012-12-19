###
A generic base page class for Copper.
###

class window.CopperPage extends Page

  initialize: ->
    CopperApplication.ensureAccessToken()
