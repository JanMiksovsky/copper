###
Cookie utility functions
###

class window.Cookie

  @cookies: ->
    cookies = {}
    for assignment in document.cookie.split ";"
      parts = assignment.split "="
      key = parts[0].trim()
      value = unescape parts[1].trim()
      cookies[ key ] = value
    cookies

  @get: ( key ) ->
    Cookie.cookies()[ key ]

  @set: ( key, value ) ->
    escaped = escape value
    document.cookie = "#{key}=#{escaped}"