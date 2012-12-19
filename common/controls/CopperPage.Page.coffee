###
A page in Copper.

Ensures authentication with Facebook.
###

class window.CopperPage extends Page

  # App id depends on whether we're running locally or in production.
  applicationId: ->
    switch window.location.hostname
      when "localhost"
        "407741369292793" # Test
      else
        "400736616662108" # Production

  initialize: ->
    Facebook.ensureAccessToken @applicationId(), @facebookPermissionsScopes

  # Permission scopes required by the app.
  facebookPermissionsScopes: [ "email", "user_birthday" ]
