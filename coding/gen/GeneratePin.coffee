###
Build-time tool to generate a set of PINs and corresponding DUP expressions that
can generate those PINs. These PINs can be used as temporary agent password.

To run:
coffee --compile GeneratePin.coffee
node GeneratePin.js

###

class PinGenerator

  @puzzle: ( power ) ->
    { m, n, value } = power
    mExpression = @multiplicationExpressions[ m ]
    nExpression = @numberExpressions[ n ]
    code = "1$#{nExpression}[$0>][\\#{mExpression}\\1-]#%."
    { m, n, value, code }

  @puzzles: ->
    ( @puzzle power for power in @powers() )

  # Return the set of pairs [m, n] such that m^n is a six- to nine-digit number.
  # Ignore cases where m = 10, because the resulting number is uninteresting as
  # a PIN.
  @powers: ->
    results = []
    for m in [2..19]
      for n in [2..19]
        if m != 10
          value = Math.pow( m, n )
          if value >= 100000 and value <= 999999999
            results.push { m, n, value }
    results

  @multiplicationExpressions:
    "2": "$+"
    "3": "$^++"
    "4": "$+$+"
    "5": "$2«+"
    "6": "$^++1«"
    "7": "$3«\\-"
    "8": "3«"
    "9": "$3«+"
    "10": "$2«+1«"
    "11": "$$2«+1«+"
    "12": "$3«\\2«+"
    "13": "$^+^+2«+"
    "14": "$3«\\-1«"
    "15": "$2$+«\\-"
    "16": "2$+«"
    "17": "$2$+«+"
    "18": "$3«+1«"
    "19": "$$3«+1«+"

  @numberExpressions:
    "4": "2«"
    "5": "2«1+"
    "6": "1«1+1«"
    "7": "1«1+1«1+"
    "8": "3«"
    "9": "3«1+"
    "10": "3«2+"
    "11": "3«3+"
    "12": "1«1+1«1«"
    "13": "1«1+2«1+"
    "14": "1«1+1«1+1«"
    "15": "2«2«1-"
    "16": "2«2«"
    "17": "2«2«1+"
    "18": "3«1+1«"
    "19": "3«1+1«1+"

# Handle direct invocation from Node.
if require? and process?
  path = require "path"
  if path.basename( process.argv[1] ) == "GeneratePin.js"
    for puzzle in PinGenerator.puzzles()
      { m, n, value, code } = puzzle
      console?.log "#{m}\t#{n}\t#{value}\t#{code}"
