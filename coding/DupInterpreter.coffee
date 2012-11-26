###
An interpreter for the DUP programming language, a variant of FALSE.
DUP created by Ian Osgood, FALSE by Wouter van Oortmerssen.
http://esolangs.org/wiki/DUP
###

class window.DupInterpreter

  constructor: ->
    @reset()

  # Parse the given string and execute the commands in the given program.
  execute: ( program ) ->
    number = null
    for character in program
      if /\d/.test character
        # Add digit to current number
        number = ( number ? 0 ) * 10 + parseInt character
      else
        if number?
          # Reached the end of a number, push that first.
          @push number
          number = null
        # Ignore whitespace
        unless /\s/.test character
          # Execute command
          @[ character ]()
    if number?
      # Program ended with a number; push that.
      @push number
    # Return the interpreter so calls can be chained
    @

  # Return the nth item from the top of the stack.
  pick: ( n ) ->
    @stack[ @stack.length - 1 - n ]

  pop: ->
    @stack.pop()

  push: ( n ) ->
    @stack.push n

  # Reset the machine state.
  reset: ->
    @stack = []

  # Reset the machine state, then execute the given program.
  run: ( program ) ->
    @reset()
    @execute program

  # The stack
  stack: []

  ###
  Commands
  The comments use FORTH notation to indicate a function's effects on the stack.
  Example: the notation ( a b -- a+b ) indicates the function takes two numbers
  a and b off the stack and leaves their sum.
  ###

  # Execute the function at TOS
  # ( function -- )
  # "!": ->
  #   ret.push ip
  #   ip = @pop()

  # While loop
  # ( [condition] [body] -- )
  # "#": ->
  #   ret.push ip, @pick(1), @pop()
  #   ip = @pop()

  # Duplicate the top of stack (FORTH: DUP)
  # ( n -- n n )
  "$": ->
    @push @pick 0

  # Pop the TOS and throw it away (FORTH: DROP)
  # ( n -- )
  "%": ->
    @pop()

  # Bitwise AND
  # ( a b -- a AND b )
  "&": ->
    @push @pop() & @pop()

  # Unicode character value of the next character in the program.
  # ( char -- Unicode value of char )
  # "'": ->
  #   @push code.charCodeAt(++ip)

  # Push from data stack to return stack (FORTH: >R)
  # ( n -- )
  # "(": ->
  #   ret.push @pop()

  # Pop from return stack to data stack (FORTH: R>)
  # ( -- n )
  # ")": ->
  #   @push ret.pop()

  # Multiply
  # ( a b -- a*b )
  "*": ->
    @push @pop() * @pop()

  # Add
  # ( a b -- a+b )
  "+": ->
    @push @pop() + @pop()

  # Write a character to the output.
  # ( char -- )
  # ",": ->
  #  put String.fromCharCode(@pop())

  # Subtract
  # ( a b -- a-b )
  "-": ->
    @push -@pop() + @pop()

  # Write the TOS to the output as a decimal number.
  # ( n -- )
  # ".": ->
  #  put @pop()

  # Divide (FORTH: /MOD )
  # ( numerator denominator -- remainder quotient )
  "/": ->
    denominator = @pop()
    numerator = @pop()
    quotient = numerator / denominator
    quotient = if quotient < 0
      Math.ceil quotient
    else
      Math.floor quotient
    remainder = numerator % denominator
    @push remainder
    @push quotient

  # Store a value into a memory address.
  # ( value address -- )
  # ":": ->
  #   vars[@pop()] = @pop()

  # Retrieve the value of a memory address.
  # ( address -- value )
  # ";": ->
  #   @push vars[@pop()]

  # Less than
  # ( a b -- a<b )
  "<": ->
    @push -( @pop() > @pop() )

  # Equals
  # ( a b -- a=b )
  "=": ->
    @push -( @pop() == @pop() )

  # Greater than
  # ( a b -- a>b )
  ">": ->
    @push -( @pop() < @pop() )

  # Conditionally execute a function
  # ( condition function -- )
  # "?": ->
  #   f = @pop()
  #   t = @pop()
  #   ret.push ip
  #   ip = (if @pop() then t else f)

  # Rotate the top three items on the stack (FORTH: ROT)
  # ( a b c -- b c a )
  "@": ->
    c = @pop()
    b = @pop()
    a = @pop()
    @push b
    @push c
    @push a

  # Begin a function lambda, reading up to the matching right brace.
  # "[": ->
  #   @push ip
  #   ip = matching_brace()

  # Swap the top two items on the stack (FORTH: SWAP)
  # ( a b -- b a )
  "\\": ->
    b = @pop()
    a = @pop()
    @push b
    @push a

  # Flush buffered input. This operator was only relevant in the original FALSE
  # language, and is preserved in DUP as a no-op only for historical
  # completeness.
  "ß": ->

  # Pick the nth item from the top of the stack.
  # ( a0 .. an n -- a0 .. an a0 )
  "ø": ->
    @push @pick @pop()

  # End a function lambda and place it on the stack.
  # "]": ->
  #   n = ret.length - 3
  #   if n >= 0 and code.charAt(ret[n]) is "#"
  #     if @pop()
  #       ret.push ret[n + 1], ret[n + 2]
  #     else
  #       ret.pop()
  #       ret.pop()
  #   ip = ret.pop()

  # Negate the number at the top of the stack.
  # ( n -- -n )
  "_": ->
    @push -@pop()

  # Read a character from the input and push  its value on the stack.
  # ( -- char )
  # This command was ^ in FALSE.
  # "`": ->
  #   @push getc()

  # Start a comment
  # "{": ->
  #   ip = seek("}")

  # Bitwise XOR
  # ( a b -- a^b )
  "|": ->
    @push @pop() ^ @pop()

  # Bitwise NOT
  # ( a -- ~a )
  "~": ->
    @push ~@pop()

  # Bitwise left shift (FORTH: lshift)
  "«": ->
    shift = @pop()
    @push @pop() << shift

  # Bitwise right shift (FORTH: rshift)
  "»": ->
    shift = @pop()
    @push @pop() >>> shift

  # Define the next character as an operator that invokes the given lambda.
  # ( function -- )
  # "⇒": ->
  #   op = @pop()
  #   commands[code.charAt(++ip)] = ->
  #     ret.push ip
  #     ip = op

  # String
  # '"': ->
  #   for (var i=@pop(); code.charAt(++ip) != '"'; ++i)
  #     vars[i] = code.charCodeAt(ip);
  #     stack.push(i);
  #   }