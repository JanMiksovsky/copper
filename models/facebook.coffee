###
Wrap access to Facebook's OAuth authorization page.
###

window.facebookAuthorizer =

    authorize: ( applicationId, redirectUri, scopes, params ) ->
      scopesParam = if scopes? then scopes.join "," else ""
      url = "https://graph.facebook.com/oauth/authorize?client_id=#{applicationId}&scope=#{scopesParam}&type=user_agent&display=page&redirect_uri=#{redirectUri}"
      
      # We also pass along the application ID as a param for use by the destination page.
      params = params or []
      params.push "applicationId=" + applicationId
      url += "?" + escape params.join "&"
      window.location = url