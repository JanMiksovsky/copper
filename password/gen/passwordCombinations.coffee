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

  # @trigrams: [
  #   "012"
  #   "013"
  #   "014"
  #   "015"
  #   "016"
  #   "017"
  #   "018"
  #   "019"
  #   "023"
  #   "024"
  #   "025"
  #   "026"
  #   "027"
  #   "028"
  #   "029"
  #   "034"
  #   "035"
  #   "036"
  #   "037"
  #   "038"
  #   "039"
  #   "045"
  #   "046"
  #   "047"
  #   "048"
  #   "049"
  #   "056"
  #   "057"
  #   "058"
  #   "059"
  #   "067"
  #   "068"
  #   "069"
  #   "078"
  #   "079"
  #   "089"
  #   "123"
  #   "124"
  #   "125"
  #   "126"
  #   "127"
  #   "128"
  #   "129"
  #   "134"
  #   "135"
  #   "136"
  #   "137"
  #   "138"
  #   "139"
  #   "145"
  #   "146"
  #   "147"
  #   "148"
  #   "149"
  #   "156"
  #   "157"
  #   "158"
  #   "159"
  #   "167"
  #   "168"
  #   "169"
  #   "178"
  #   "179"
  #   "189"
  #   "234"
  #   "235"
  #   "236"
  #   "237"
  #   "238"
  #   "239"
  #   "245"
  #   "246"
  #   "247"
  #   "248"
  #   "249"
  #   "256"
  #   "257"
  #   "258"
  #   "259"
  #   "267"
  #   "268"
  #   "269"
  #   "278"
  #   "279"
  #   "289"
  #   "345"
  #   "346"
  #   "347"
  #   "348"
  #   "349"
  #   "356"
  #   "357"
  #   "358"
  #   "359"
  #   "367"
  #   "368"
  #   "369"
  #   "378"
  #   "379"
  #   "389"
  #   "456"
  #   "457"
  #   "458"
  #   "459"
  #   "467"
  #   "468"
  #   "469"
  #   "478"
  #   "479"
  #   "489"
  #   "567"
  #   "568"
  #   "569"
  #   "578"
  #   "579"
  #   "589"
  #   "678"
  #   "679"
  #   "689"
  #   "789"
  # ]

# Handle direct invocation from Node.
if require? and process?
  path = require "path"
  if path.basename( process.argv[1] ) == "PasswordCombinations.js"
    console?.log PasswordCombinations.trigrams()