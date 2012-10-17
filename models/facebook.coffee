###
Wrap access to Facebook.
###

class window.Facebook

  @authorize: ( applicationId, redirectUri, scopes, params ) ->
    scopesParam = if scopes? then scopes.join "," else ""
    url = "https://graph.facebook.com/oauth/authorize?client_id=#{applicationId}&scope=#{scopesParam}&type=user_agent&display=page&redirect_uri=#{redirectUri}"
    
    # We also pass along the application ID as a param for use by the destination page.
    params = params or []
    params.push "applicationId=" + applicationId
    url += "?" + escape params.join "&"
    window.location = url

  @_baseUrl: "https://graph.facebook.com/"

  @currentUser: ( callback ) ->
    @_call "me", null, callback

  # Main Facebook call entry point.
  @_call: ( path, params, callback ) ->
    @_getAccessToken()
    callParams = [
      "access_token=#{@accessToken}"
      "callback=?" # Required for $.getJSON to work.
    ]
    if params
      callParams = callParams.concat(params)
    callParamList = callParams.join "&"
    url = "#{@_baseUrl}#{path}?#{callParamList}"
    $.getJSON url, ( results ) ->
      unless results.error?
        callback results

  @_getAccessToken: ->
    if not @accessToken?
      @accessToken = Page.urlParameters().access_token
