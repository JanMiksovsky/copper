window.logout = ->
  env.userName = null
  env.homeDirectory = null
  login()