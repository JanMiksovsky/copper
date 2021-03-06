class PasswordValidator

  constructor: ( @accountId ) ->
    # Pick a puzzle for this account to solve.
    # Use the account ID as a hash into the set of possible puzzles to ensure
    # each account always gets the same puzzle.
    puzzles = PasswordValidator.puzzles()
    hash = parseInt( accountId ) % puzzles.length
    @puzzle = puzzles[ hash ]

  # Add up the digit values in the given trigram.
  # E.g. the checksum for "206" is 8.
  checksum: ( trigram ) ->
    parseInt( trigram[0] ) + parseInt( trigram[1] ) + parseInt( trigram[2] )

  # Return the set of possible puzzles.
  @puzzles: ->
    puzzles = []
    for i in [3..24]
      for j in [3..24]
        if i + j >= 15 and i + j <= 39
          puzzles.push [ i, j ]
    puzzles

  # Return the unique members of the given array (or string).
  @unique: ( array ) ->
    result = []
    for item in array
      found = false
      for existingItem in result
        if item == existingItem
          found = true
          break
      unless found
        result.push item
    result

  # Verify whether the indicated password passes the constraints for the
  # current puzzle.
  validate: ( password ) ->
    checksumHead = @puzzle[0]
    checksumTail = @puzzle[1]
    if password.length < 9
      "That password is too short."
    else if not /^[0-9]*$/.test password  # All digits?
      "A password can contain only numeric digits."
    else if PasswordValidator.unique( password ).length < password.length
      "Password digits may not be repeated."
    else if checksumHead != @checksum password.slice 0, 3
      "The first three digits must add to #{checksumHead}."
    else if checksumTail != @checksum password.slice password.length - 3
      "The last three digits must add to #{checksumTail}."
    else
      "Your password has been changed."
