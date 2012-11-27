###
An interpreter for the DUP programming language, a variant of FALSE.
DUP created by Ian Osgood, FALSE by Wouter van Oortmerssen.
http://esolangs.org/wiki/DUP
###

class window.DupInterpreter

  constructor: ( @program ) ->
    @reset()

  # The set of commands available to the interpreter.
  # The default value of this is the DupInterpreter.commands collection.
  commands: null

  # Force program to end by setting program counter past end of program.
  end: ->
    @goto @program.length

  # Call the program at the indicated point, then come back to this point.
  gosub: ( index ) ->
    @returnStack.push @pc
    @goto index

  # Move the program counter to the indicated point in the program.
  goto: ( index ) ->
    @pc = index

  # Program memory
  memory: null

  # Reset the machine, then execute the program.
  run: ( program ) ->
    if program?
      @program = program
    @reset()
    number = null
    while @pc < @program.length
      character = @program[@pc]
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
          command = @commands[ character ]
          if command?
            # Execute command
            command.call @
          else
            # Any other character gets pushed onto stack.
            @push character
      @pc++
    if number?
      # Program ended with a number; push that.
      @push number
      number = null
    # Return the interpreter so calls can be chained
    @

  # Program counter: current character position in program we're executing.
  pc: null

  # Return the nth item from the top of the stack.
  pick: ( n ) ->
    @stack[ @stack.length - 1 - n ]

  pop: ->
    @stack.pop()

  push: ( n ) ->
    @stack.push n

  # Read a character from the input stream.
  # This method should be overridden to obtain input from the desired location.
  read: ->

  # Reset the machine state.
  reset: ->
    @commands = DupInterpreter.commands
    @stack = []
    @returnStack = []
    @memory = []
    @goto 0

  # Return stack (also known as the secondary stack)
  returnStack: null

  # Advance the program counter to the specified character.
  # If not found, the program counter is advanced to the end of the program.
  # TODO: Cache results
  seek: ( character ) ->
    index = @program.indexOf character, @pc + 1
    if index < 0
      @end() # Not found
    else
      @goto index

  # Advance the program counter to the matching right bracket, taking care to
  # avoid right brackets which might appear in comments, strings, or quoted
  # characters.
  seekRightBracket: ->
    while @pc < @program.length
      character = @program.charAt ++@pc
      switch character
        when "]"
          return
        when "["
          @seekRightBracket()
        when "\""
          @seek "\""
        when "{"
          @seek "}"
        when "'"
          @pc++

  # The stack
  stack: null

  # Write a character to the output stream.
  # This method should be overridden to direct output to the desired location.
  write: ( character ) ->

###
DUP built-in commands

This collection is maintained on the DupInterpreter class. It's copied to
interpreter instances before the interpreter runs, because the ⇒ operator can
destructively modify the built-in commands. This ensures that one program run
can't contaminate subsequent program runs.

The comments use FORTH notation to indicate a function's effects on the stack.
Example: the notation ( a b -- a+b ) indicates the function takes two numbers
a and b off the stack and leaves their sum.

###
DupInterpreter.commands = 
  
  # Execute the function at TOS
  # ( function -- )
  "!": ->
    @returnStack.push @pc
    @goto @pop()

  # While loop
  # ( [condition] [body] -- )
  "#": ->

    # Check the return stack to look for a marker indicating we've just finished
    # running the condition lambda or the body lambda.
    topOfReturn = @returnStack[ @returnStack.length - 1 ]
    isWhileMarker = ( topOfReturn == @pc )

    if !isWhileMarker
      # Invoking while loop for first time.
      # Pop lambdas off data stack.
      body = @pop()
      condition = @pop()
      lambda = condition
    else
      @returnStack.pop() # Pop off marker
      # Next item on return stack indicates whether we were executing condition
      # or body lambda.
      executedCondition = @returnStack.pop()
      body = @returnStack.pop()
      condition = @returnStack.pop()
      lambda = if executedCondition
        # Just executed condition lambda, which left its result on the stack.
        if @pop() == 0
          # While condition returned false. Terminate while loop.
          null
        else
          # While condition returned true. Execute body lambda.
          body
      else
        # Just executed body, now execute condition lambda.
        condition

    if lambda?
      # Prepare to invoke lambda, leaving markers on return stack sufficient
      # to reconstruct the while loop state when control returns to "#".
      @returnStack.push condition
      @returnStack.push body
      @returnStack.push lambda == condition
      @returnStack.push @pc # Marker
      @returnStack.push @pc - 1 # Come back here
      @goto lambda

  # Duplicate the top of stack (FORTH: DUP)
  # ( a -- a a )
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
  "'": ->
    code = @program.charCodeAt ++@pc
    @push code

  # Push from data stack to return stack (FORTH: >R)
  # ( n -- )
  "(": ->
    @returnStack.push @pop()

  # Pop from return stack to data stack (FORTH: R>)
  # ( -- n )
  ")": ->
    @push @returnStack.pop()

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
  ",": ->
    character = String.fromCharCode @pop()
    @write character

  # Subtract
  # ( a b -- a-b )
  "-": ->
    @push -@pop() + @pop()

  # Write the TOS to the output as a decimal number.
  # ( n -- )
  ".": ->
    @write @pop()

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
  ":": ->
    address = @pop()
    @memory[ address ] = @pop()

  # Retrieve the value of a memory address.
  # ( address -- value )
  ";": ->
    address = @pop()
    @push @memory[ address ]

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
  # ( condition if-true if-false -- )
  "?": ->
    falseLambda = @pop()
    trueLambda = @pop()
    condition = @pop()
    lambda = if condition then trueLambda else falseLambda
    @gosub lambda

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
  "[": ->
    @push @pc
    @seekRightBracket()

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
  "]": ->
    @goto @returnStack.pop()

  # Copy the second item from the top of the stack (FORTH: OVER)
  # ( a b -- a b a )
  "^": ->
    @push @pick 1

  # Negate the number at the top of the stack.
  # ( n -- -n )
  "_": ->
    @push -@pop()

  # Read a character from the input and push its value on the stack.
  # ( -- char )
  # Return -1 for end-of-input. This command was ^ in FALSE.
  "`": ->
    character = @read()
    code = if character?.length > 0
      character.charCodeAt 0
    else
      -1
    @push code

  # Start a comment
  "{": ->
    @seek "}"

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
  "⇒": ->
    lambda = @pop()
    character = @program.charAt ++@pc
    @commands[ character ] = =>
      @gosub lambda

  # Copy string to memory
  # ( address -- address+length )
  '"': ->
    memoryStart = @pop()
    stringStart = @pc + 1
    @seek "\""
    stringEnd = @pc - 1
    length = stringEnd - stringStart + 1
    for i in [ 0 .. length - 1 ]
      @memory[ memoryStart + i ] = @program.charCodeAt stringStart + i
    @push memoryStart + length