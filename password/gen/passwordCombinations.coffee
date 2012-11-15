###
Build-time class to generate the ranges of allowable password combinations.
###

class PasswordCombinations

  @checksum: ( trigram ) ->
    parseInt( trigram[0] ) + parseInt( trigram[1] ) + parseInt( trigram[2] )

  # Given a trigram, remove its digits from the set of digits, and return the
  # set of trigrams which can be generated from the resulting reduced digit set.
  @counterparts: ( trigram ) ->
    reduced = @subtract trigram, @digits
    @trigrams reduced

  @digits: "0123456789"

  @factorial: (n) ->
    if n <= 1 then 1 else n * @factorial n - 1

  # All permutations of n characters taken from string s.
  @permutations: ( s, n ) ->
    result = []
    if n > 0
      for char, i in s
        rest = s.substr( 0, i ) + s.slice( i + 1 )
        if n == 1
          result.push char
        else
          for subpermutation in @permutations rest, n - 1
            result.push char + subpermutation
    result

  @puzzle: ( trigram1, trigram2 ) ->
    [ @checksum( trigram1 ), @checksum( trigram2 ) ]

  @puzzles: ->
    puzzles = ( for trigramPair in @trigramPairs @digits
      @puzzle trigramPair[0], trigramPair[1]
    )
    @unique puzzles, ( puzzle1, puzzle2 ) =>
      # Puzzles are equal if their respective trigrams have the same checksum.
      puzzle1[0] == puzzle2[0] and puzzle1[1] == puzzle2[1]

  # Return a new string containing the sorted characters from s.
  @sortString: ( s ) ->
    array = ( char for char in s )
    result = ""
    for item in array.sort()
      result += item
    result

  @subtract: ( charsToRemove, s ) ->
    regex = new RegExp "[#{charsToRemove}]", "g"
    s.replace regex, ""
  
  # All unique permutations of three characters.
  @trigrams: ( s) ->
    @uniquePermutations s, 3

  # The combination of all pairs of trigrams which can be made from the given
  # set. The first trigram is selected from the set, and the unused set elements
  # are then used to construct a second trigram.
  @trigramPairs: ( s ) ->
    result = []
    for trigram in @trigrams s
      combinations = ( [ trigram, counterpart ] for counterpart in @counterparts trigram )
      result = result.concat combinations
    result

  # Return the unique members of the given array (or string).
  @unique: ( array, compare ) ->
    result = []
    for item in array
      found = false
      for existingItem in result
        if compare item, existingItem
          found = true
          break
      if not found
        result.push item
    result

  # Unique permutations
  # "ab" and "ba" are considered the same.
  @uniquePermutations: ( s, n ) ->
    permutations = @permutations s, n
    compareSorted = ( x, y ) => @sortString( x ) == @sortString( y )
    @unique permutations, compareSorted

# Handle direct invocation from Node.
if require? and process?
  path = require "path"
  if path.basename( process.argv[1] ) == "PasswordCombinations.js"
    console?.log PasswordCombinations.puzzles()
