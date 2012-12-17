class window.FacebookApplication

  # App id depends on whether we're running locally or in production.
  @id: ->
    return if window.location.hostname == "localhost"
      "407741369292793" # Test
    else
      "400736616662108" # Production