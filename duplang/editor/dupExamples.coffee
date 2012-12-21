###
Example DUP programs accessible from within the editor.

These are defined as "User-Friendly Name": "src"

NOTE: If the source uses the DUP swap operator (backslash), it must be escaped
as "\\".
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
    0"Hello, world."0\\:  { store a string }
    0p                   { print the string }
  """

,

  name: "Power"
  program: """
    { Calculate m to the nth power. ( m n -- m^n ) }

    [
      $0>        { n greater than 0? }
        [1-^\\p*] { power(m, n) = m * power(m, n-1) }
        [%%1]    { power(m, 0) = 1 }
      ?
    ]⇒p

    { Calculate 3 to the power of 5 }
    3 5p.
  """

,

  name: "Strings"
  program: """
    { print a null-terminated string }
    [[$;][$;,1+]#%]⇒p

    { Read input to null-terminated string }
    [[`$1_=~][^:1+]#%0\\:]⇒r

    { Parse null-terminated string as number }
    [0\\[$;$][48-@10*+\\1+]#%%]⇒i

    { Demonstrate: Enter a number in the input panel, then parse and output it. }
    0r 0i .
  """

,

  name: "Temperature"
  program: """
    { Convert Fahrenheit to Celsius ( f -- c ) }

    [
      32 -
      9/\\% { divide and drop remainder }
      5 *
    ]⇒c

    212c.
  """

,

  name: "Threat Assessment"
  program: """
    {
    Function: Determine whether input criteria satisfy threat conditions
    Author: Dept. of Unified Protection - Threat Systems Division

    Given three values stored at location x, y, and z, the function t
    produces a single true/false value indicating whether a suspect
    is a threat or not.

    Modification of this algorithm unauthorized without prior review by
    D.U.P. Threat Authority Board.
    }

    [x;y;z;||]⇒a     { a returns x XOR y XOR z }
    [x;y;~z;~&&~]⇒b  { b returns ??? }
    [ab&]⇒t          { t returns a AND NOT(b) }

    [z:y:x:]⇒s       { helper: store top three values to x, y, z }
    [st.10,]⇒p       { test: store, evaluate with function t, then print }

    { Test all combinations }
    { Note that 1_ is DUP notation for -1 (true) }

    {  Input    Expected output }
      0 0 0 p   {  0 }
      0 0 1_p   { -1 }
      0 1_0 p   { -1 }
      0 1_1_p   {  0 }
      1_0 0 p   {  0 }
      1_0 1_p   {  0 }
      1_1_0 p   {  0 }
      1_1_1_p   { -1 }
    """

]
