###
Unit tests for PasswordValidator.
###

$ ->

  module "PasswordValidator"

  checkPassword = ( accountId, password, expectedMessage ) ->
    validator = new PasswordValidator accountId
    message = validator.validate password
    equal message, expectedMessage

  testAccount1 = "2063693297"
  testAccount2 = "2063254651"

  test "empty password", ->
    checkPassword testAccount1, "", "Password too short"

  test "short password", ->
    checkPassword testAccount1, "abc", "Password too short"

  test "non-numeric", ->
    checkPassword testAccount1, "abcdefghi", "Password can contain only numeric digits"

  test "repeated digits", ->
    checkPassword testAccount1, "111111111", "Digits may not be repeated"

  test "checksum on first three digits", ->
    checkPassword testAccount1, "123456789", "First three digits must add to 9"

  test "checksum on last three digits", ->
    checkPassword testAccount1, "234156789", "Last three digits must add to 10"

  test "valid password", ->
    checkPassword testAccount1, "234567019", "Password changed"

  test "valid password for another number", ->
    checkPassword testAccount2, "986345012", "Password changed"
