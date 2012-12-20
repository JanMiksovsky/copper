commands.help = ->
  stdout.writeln commands.help.message

commands.help.message = """

Available commands:

cat [filename]      Display the contents of file(s)
cd [directoryname]  Change directory. Enter "cd .." to go up one level.
clear               Clear the terminal console
dup [file.dup]      Run a DUP program
echo [arguments]    Echo arguments
help                Display this message
logout              Log out
ls                  List directory contents
open [file]         Open a file
pwd                 Display the name of the current directory
whoami              show the name of the current user

"""