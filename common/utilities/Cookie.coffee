###
Cookie utility functions

These are for cookies shared across pages within a single domain.
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

  @delete: ( key ) ->
    document.cookie = "#{key}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;"

  @get: ( key ) ->
    Cookie.cookies()[ key ]

  @set: ( key, value ) ->
    escaped = escape value
    document.cookie = "#{key}=#{escaped};path=/"