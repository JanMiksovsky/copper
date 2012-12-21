###
Example DUP programs accessible from within the editor.

These are defined as "User-Friendly Name": "src"
###

window.dupExamples = [

  name: "Factorial"
  program: """
    { Factorial ( n -- n! ) }

    [
      $1>        { Greater than 1? }
        [$1-f*]  { fact(n) = fact(n - 1 ) * n }
        [%1]     { fact(1) = 1 }
      ?
    ]⇒f          { Define the factorial function }

    { Example: calculate 7! }
    7f.
  """

,

  name: "Hello, world"
  program: """
    { Hello, world in DUP }

    [[$;][$;,1+]#%]⇒p   { print null-terminated string }
    0"Hello, world."0\:  { store a string }
    0p                   { print the string }
  """

]
