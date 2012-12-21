class window.DupHelpPane extends DupTab

  inherited:
    content: [
      html: "<pre>", content: """
        Stack Op  Effect
            n !   Call function at index n
          c b #   While condition c is true, do b  
            a $   Duplicate a
            a %   Drop a
          a b &   a AND b
              '   Push next character on stack
            a (   Push a to return stack
              )   Pop from return stack
          a b *   a*b
          a b +   a+b
            n ,   Output Unicode character n
          a b -   a-b
            a .   Output integer a
          a b /   divide b by a; get remainder, quotient
          a n :   Store a at memory address n
            n ;   Fetch from memory address n
          a b <   -1 if a < b, else 0
          a b =   -1 if a = b, else 0
      """
    ,
      html: "<pre>", content: """
          a b >   -1 if a > b, else 0
        c t f ?   If c is non-zero, do t, else f
        a b c @   b c a (rotate)
              [   Begin function, leave index
          a b \\   b a (swap)
        ... n ø   Pick nth item from top
              ]   Return from function
          a b ^   Copy a to top of stack
            n _   Negative n
              `   Read character from input
              {   Start comment
              }   End comment
          a b |   a XOR b
            a ~   NOT a
          a n «   Shift a's bits left by n places
          a n »   Shift a's bits right by n places
            f ⇒  Define next character as a function
            n "   Copy string to memory address n
      """
    ]
    description: "Help"
