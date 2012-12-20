window.login = ( userName ) ->

  terminal.clear()
  window.stdout = terminal
  stdout.writeln login.welcome
  env.prompt = "login: "
  if userName?
    login._startShellForUser userName
  else
    terminal.readln ( userName ) ->
      if userName?.length > 0
        env.prompt = "password: "
        terminal.readln ( password ) ->
          login._startShellForUser userName
      else
        login() # Start over

login._startShellForUser = ( userName ) ->
  stdout.writeln "#{userName} logged in"
  stdout.writeln "#{new Date()}"
  stdout.writeln login.motd
  env.setUser userName
  commands.sh()

login.welcome = """
Welcome to the D.U.P. agent console

This server is for use only by authorized Department of Unified Protection
agents. Use of this service constitutes acceptance of our security policies.
If you do not agree to or understand these policies, or are not an authorized
agent, you must disconnect immediately.

"""

login.motd = """
Enter "help" for a list of commands.
"""