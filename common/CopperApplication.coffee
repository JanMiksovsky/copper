###
Top-level application object.
Handles ensuring Facebook authentication.
###

class window.CopperApplication

  # App id depends on whether we're running locally or in production.
  # Note: not a function -- we can compute this at load time.
  @applicationId:
    switch window.location.hostname
      when "localhost"
        "407741369292793" # Test
      else
        "400736616662108" # Production

  @ensureAccessToken: ->
    Facebook.ensureAccessToken @applicationId, @requiredPermissions

  # Facebook permission scopes required by the app.
  @requiredPermissions: [ "email", "user_birthday" ]
