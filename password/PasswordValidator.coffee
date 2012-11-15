class window.PasswordValidator

  constructor: ( @accountId ) ->
    if not PasswordValidator.puzzles?
      PasswordValidator.puzzles = PasswordValidator.generatePuzzles()
    trigramHead = @accountId.slice 0, 3
    trigramTail = @accountId.slice 3, 6
    @checksumHead = @checksum trigramHead
    @checksumTail = @checksum trigramTail

  validate: ( password ) ->
    if password.length < 9
      "Password too short"
    else if not /^[0-9]*$/.test password  # All digits?
      "Password can contain only numeric digits"
    else if Utilities.unique( password ).length < password.length
      "Digits may not be repeated"
    else if @checksumHead != @checksum password.slice 0, 3
      "First three digits must add to #{@checksumHead}"
    else if @checksumTail != @checksum password.slice password.length - 3
      "Last three digits must add to #{@checksumTail}"
    else
      "Password changed"

  checksum: ( trigram ) ->
    parseInt( trigram[0] ) + parseInt( trigram[1] ) + parseInt( trigram[2] )

  # Hash a numeric account ID into the numeric trigram space
  # hash: ( accountId ) ->
  #   parseInt( accountId ) % @possibleTrigrams

  @generatePuzzles: ->
    puzzles = []
    for i in [3..24]
      for j in [3..24]
        if i + j >= 15 and i + j <= 39
          puzzles.push [ i, j ]
    puzzles