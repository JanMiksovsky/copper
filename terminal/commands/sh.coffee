commands.sh = ->

  # For debugging, uncomment the lines below to expose all commands on the
  # window global so commands can be easily invoked in the debug console.
  # for name, command of commands
  #   window[ name ] = command

  unless env.currentDirectory
    env.currentDirectory = "/"
  env.prompt = "$ "
  window.stdout = terminal
  terminal.readln ( s ) ->
    switch s
      when ""
        break
      when "exit", "logout"
        logout()
        return      
      else
        { command, args, redirect } = commands.sh.parse s
        commandFn = commands[ command ]
        if commandFn?
          if redirect?
            existingFile = env.currentDirectory.getFileWithName redirect
            if existingFile?
              outputFile = existingFile
            else
              outputFile = new TextFile redirect, env.currentDirectory
              env.currentDirectory.contents.push outputFile
            window.stdout = outputFile
          commandFn args...
        else
          stdout.writeln "#{command}: command not found"
    commands.sh()

commands.sh.parse = ( s ) ->
  parts = s.split ">"
  main = parts[0]
  redirect = parts[1]?.trim()
  args = main.split " "
  command = args.shift()
  return { command, args, redirect }