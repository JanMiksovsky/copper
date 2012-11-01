###
Wrap access to Facebook.
###

class window.Facebook

  @accessToken: ->
    Page.urlParameters().access_token

  # Get an access token
  @authorize: ( applicationId, redirectUri, scopes, params ) ->
    scopesParam = if scopes? then scopes.join "," else ""
    url = "https://graph.facebook.com/oauth/authorize?client_id=#{applicationId}&scope=#{scopesParam}&type=user_agent&display=page&redirect_uri=#{redirectUri}"
    
    # We also pass along the application ID as a param for use by the destination page.
    params = params or []
    params.push "applicationId=" + applicationId
    url += "?" + escape params.join "&"
    window.location = url

  @currentUser: ( callback ) ->
    @_cachedFacebookCall "me", null, callback

  @currentUserFriends: ( callback ) ->
    @_cachedFacebookCall "me/friends", null, ( result ) =>
      callback result.data

  # Return the picture for the given user, using either a user object or an ID.
  @pictureUrlForUser: ( user, size ) ->
    id = user.id ? user
    size = size ? 160
    "#{@_baseUrl}#{id}/picture?access_token=#{@accessToken()}&height=#{size}&width=#{size}"

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
