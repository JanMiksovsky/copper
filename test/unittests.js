
/*
Unit tests for PasswordValidator.
*/


(function() {

  $(function() {
    var checkPassword, testAccount1, testAccount2;
    checkPassword = function(accountId, password, expectedMessage) {
      var message, validator;
      validator = new PasswordValidator(accountId);
      message = validator.validate(password);
      return equal(message, expectedMessage);
    };
    testAccount1 = "2063693297";
    testAccount2 = "2063254651";
    test("PasswordValidator: empty password", function() {
      return checkPassword(testAccount1, "", "Password too short");
    });
    test("PasswordValidator: short password", function() {
      return checkPassword(testAccount1, "abc", "Password too short");
    });
    test("PasswordValidator: non-numeric", function() {
      return checkPassword(testAccount1, "abcdefghi", "Password can contain only numeric digits");
    });
    test("PasswordValidator: repeated digits", function() {
      return checkPassword(testAccount1, "111111111", "Digits may not be repeated");
    });
    test("PasswordValidator: checksum on first three digits", function() {
      return checkPassword(testAccount1, "123456789", "First three digits must add to 8");
    });
    test("PasswordValidator: checksum on last three digits", function() {
      return checkPassword(testAccount1, "125346789", "Last three digits must add to 18");
    });
    return test("PasswordValidator: valid password", function() {
      return checkPassword(testAccount1, "125379468", "Password changed");
    });
  });

}).call(this);
