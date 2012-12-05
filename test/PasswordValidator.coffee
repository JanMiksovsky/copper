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
    checkPassword testAccount1, "", "That password is too short."

  test "short password", ->
    checkPassword testAccount1, "abc", "That password is too short."

  test "non-numeric", ->
    checkPassword testAccount1, "abcdefghi", "A password can contain only numeric digits."

  test "repeated digits", ->
    checkPassword testAccount1, "111111111", "Password digits may not be repeated."

  test "checksum on first three digits", ->
    checkPassword testAccount1, "123456789", "The first three digits must add to 9."

  test "checksum on last three digits", ->
    checkPassword testAccount1, "234156789", "The last three digits must add to 10."

  test "valid password", ->
    checkPassword testAccount1, "234567019", "Your password has been changed."

  test "valid password for another number", ->
    checkPassword testAccount2, "986345012", "Your password has been changed."
