###
Log out from the terminal.
###

window.logout = ->
  env.userName = null
  env.homeDirectory = null
  login()