###
Wrap access to Facebook.
###

class window.Facebook

  @accessToken: ( accessToken ) ->
    if accessToken is undefined
      Cookie.get "accessToken"
    else
      Cookie.set "accessToken", accessToken

  # Get an access token
  @authorize: ( applicationId, redirectUri, scopes, params ) ->
    scopesParam = if scopes? then scopes.join "," else ""
    url = "https://graph.facebook.com/oauth/authorize?client_id=#{applicationId}&scope=#{scopesParam}&type=user_agent&display=page&redirect_uri=#{redirectUri}"
    if params?
      url += "?" + escape params.join "&"
    window.location = url

  @currentUser: ( callback ) ->
    @_cachedFacebookCall "me", null, callback

  @currentUserFriends: ( callback ) ->
    @_cachedFacebookCall "me/friends", null, ( result ) =>
      callback result.data

  # Check to make sure we have an access token from Facebook.
  # If not, get one and redirect back to the current page.
  @ensureAccessToken: ( applicationId, scopes ) ->
    # See if there's an access token on the URL.
    accessToken = Page.urlParameters().access_token
    if accessToken?
      # We've returned from a Facebook auth redirect.
      # Get the token from the URL, and remove everything after the "#".
      @accessToken accessToken
      window.location.hash = ""
    else
      # Rely upon token in cookie.
      accessToken = @accessToken()
    unless accessToken?
      # Get a new token.
      # Redirect back to this page
      url = window.location.origin + window.location.pathname
      @authorize applicationId, url, scopes

  @isFakeUser: ( user ) ->
    id = user.id ? user
    parseInt( id ) < 0

  # Return the picture for the given user, using either a user object or an ID.
  @pictureUrlForUser: ( user, size ) ->
    id = user.id ? user
    if Facebook.isFakeUser user
      return fakeFacebookUsers[ id ].picture
    size = size ? 160
    "#{@_baseUrl}#{id}/picture?access_token=#{@accessToken()}&height=#{size}&width=#{size}"

  @profileForUser: ( user, callback ) ->
    id = user.id ? user
    if Facebook.isFakeUser user
      callback fakeFacebookUsers[ id ]
    else
      @_cachedFacebookCall id, null, callback

  # Construct a URL that includes the path and the indicated params
  @url: ( path, params ) ->
    paramList = if params?
      "?" + params.join "&"
    else
      ""
    "#{@_baseUrl}#{path}#{paramList}"

  @_baseUrl: "https://graph.facebook.com/"

  # Cached Facebook call results
  @_cache: {}

  @_cachedFacebookCall: ( path, params, callback ) ->
    # Use URL (without access token and "callback" params) as cache key.
    key = @url path, params
    if Facebook._cache[ key ]
      callback Facebook._cache[ key ]
    else
      @_facebookCall path, params, ( result ) ->
        Facebook._cache[ key ] = result
        callback result

  # Actually call Facebook graph API.
  @_facebookCall: ( path, params, callback ) ->
    callParams = [
      "access_token=#{@accessToken()}"
      "callback=?" # Required for $.getJSON to work.
    ]
    params = if params? then callParams.concat params else callParams
    url = @url path, params
    $.getJSON url, ( result ) ->
      unless result.error?
        callback result
