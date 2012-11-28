class window.DupHelp extends Control

  inherited:
    content: """
          n !   call function at index n
        c b #   while condition c is true, do b
          a $   duplicate a
          a %   drop a
        a b &   a AND b
            '   place next character on stack
          a (   push a to return stack
            )   pop from return stack
        a b *   a*b
        a b +   a+b
          n ,   output Unicode character n
        a b -   a-b
          a .   output a
        a b /   a/b
        a n :   store a at memory address n
          n ;   fetch from memory address n
        a b <   -1 if a < b, else 0
        a b =   -1 if a = b, else 0
        a b >   -1 if a > b, else 0
      c t f ?   if c is non-zero, do t, else f
      a b c @   b c a (rotate)
            [   begin function, leave index
        a b \   b a (swap)
      ... n ø   pick nth item from top
            ]   return from function
          n _   negative n
            `   read character from input
            {   start comment
            }   end comment
        a b |   a XOR b
          a ~   NOT a
        a n «   shift a's bits left by n places
        a n »   shift a's bits right by n places
          f ⇒  define next character as a function
          n "   copy string to memory address n
    """

  tag: "pre"