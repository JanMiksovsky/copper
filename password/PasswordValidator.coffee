exports = window ? module.exports

class exports.PasswordValidator

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

  # Verify whether the indicated password passes the constraints for the
  # current puzzle.
  validate: ( password ) ->
    checksumHead = @puzzle[0]
    checksumTail = @puzzle[1]
    if password.length < 9
      "Password too short"
    else if not /^[0-9]*$/.test password  # All digits?
      "Password can contain only numeric digits"
    else if Utilities.unique( password ).length < password.length
      "Digits may not be repeated"
    else if checksumHead != @checksum password.slice 0, 3
      "First three digits must add to #{checksumHead}"
    else if checksumTail != @checksum password.slice password.length - 3
      "Last three digits must add to #{checksumTail}"
    else
      "Password changed"

  @test: ->
    "/4"
