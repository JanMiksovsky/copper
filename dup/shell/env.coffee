###
Global shell-style environment variables.
###

window.env =

  currentDirectory: null
  
  prompt: null

  readme: """
    Agents who have not yet completed compulsory training should enter "help" at
    the console prompt.

  """

  setUser: ( userName ) ->
    unless fs.root?
      fs.root = new Directory "/", null, files
    env.userName = userName
    homePath = fs.join "/usr", userName
    homeDirectory = fs.root.getDirectoryWithPath homePath
    env.homeDirectory = homeDirectory ? fs.root
    if env.homeDirectory.contents?.length == 0
      readme = new TextFile "readme", null, env.readme
      env.homeDirectory.addFile readme
    env.currentDirectory = env.homeDirectory

  userName: null
