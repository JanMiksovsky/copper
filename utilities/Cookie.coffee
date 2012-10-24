###
Cookie utility functions
###

class window.Cookie

  @cookies: ->
    documentCookie = document.cookie
    cookies = {}
    if documentCookie?.length > 0
      for assignment in documentCookie.split ";"
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