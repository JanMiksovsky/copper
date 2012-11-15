###
Unit tests for PasswordValidator.
###

$ ->

  checkPassword = ( accountId, password, expectedMessage ) ->
    validator = new PasswordValidator accountId
    message = validator.validate password
    equal message, expectedMessage

  testAccount1 = "2063693297"
  testAccount2 = "2063254651"

  test "PasswordValidator: empty password", ->
    checkPassword testAccount1, "", "Password too short"

  test "PasswordValidator: short password", ->
    checkPassword testAccount1, "abc", "Password too short"

  test "PasswordValidator: non-numeric", ->
    checkPassword testAccount1, "abcdefghi", "Password can contain only numeric digits"

  test "PasswordValidator: repeated digits", ->
    checkPassword testAccount1, "111111111", "Digits may not be repeated"

  test "PasswordValidator: checksum on first three digits", ->
    checkPassword testAccount1, "123456789", "First three digits must add to 9"

  test "PasswordValidator: checksum on last three digits", ->
    checkPassword testAccount1, "234156789", "Last three digits must add to 10"

  test "PasswordValidator: valid password", ->
    checkPassword testAccount1, "234567019", "Password changed"

  test "PasswordValidator: valid password for another number", ->
    checkPassword testAccount2, "986345012", "Password changed"
