###
Build-time class to generate the ranges of allowable password combinations.
###

class PasswordCombinations

  @checksum: ( trigram ) ->
    parseInt( trigram[0] ) + parseInt( trigram[1] ) + parseInt( trigram[2] )

  @digits: "0123456789"

  @factorial: (n) ->
    if n <= 1 then 1 else n * @factorial n - 1
  
  @trigrams: ->
    @uniquePermutations @digits, 3

  @ranges: ->
    ranges = {}
    for sum in @trigramSums @trigrams
      ranges[ sum ] = []
    ranges

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

  @sortString: ( s ) ->
    array = ( char for char in s )
    result = ""
    for item in array.sort()
      result += item
    result

  @trigramSums: ( trigrams ) ->
    sums = []
    for trigram in trigrams
      sum = @checksum trigram
      if sums.indexOf( sum ) < 0
        sums.push sum
    sums

  # Return the unique members of the given array (or string).
  @unique: ( array ) ->
    result = []
    for item in array
      if result.indexOf( item ) < 0
        result.push item
    result

  # Unique permutations
  # "ab" and "ba" are considered the same.
  @uniquePermutations: ( s, n ) ->
    permutations = @permutations s, n
    sorted = ( @sortString permutation for permutation in permutations )
    @unique sorted

# Handle direct invocation from Node.
if require? and process?
  path = require "path"
  if path.basename( process.argv[1] ) == "PasswordCombinations.js"
    console?.log PasswordCombinations.trigrams()