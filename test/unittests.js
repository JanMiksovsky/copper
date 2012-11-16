(function() {

  $(function() {
    test("machine: push", function() {
      var machine;
      machine = new DupMachine();
      deepEqual(machine.stack, []);
      machine.push(1);
      deepEqual(machine.stack, [1]);
      machine.push(2);
      return deepEqual(machine.stack, [1, 2]);
    });
    return test("machine: add", function() {
      var machine;
      machine = new DupMachine();
      deepEqual(machine.stack, []);
      machine.push(1);
      machine.push(2);
      machine.add();
      return deepEqual(machine.stack, [3]);
    });
  });

}).call(this);

(function() {

  $(function() {
    var stackEqual;
    stackEqual = function(code, expected) {
      var output, program;
      program = new DupProgram(code);
      output = program.run();
      return deepEqual(output, expected);
    };
    return test("dup: hello", function() {
      return stackEqual("hello", 5);
    });
  });

}).call(this);


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
      return checkPassword(testAccount1, "123456789", "First three digits must add to 9");
    });
    test("PasswordValidator: checksum on last three digits", function() {
      return checkPassword(testAccount1, "234156789", "Last three digits must add to 10");
    });
    test("PasswordValidator: valid password", function() {
      return checkPassword(testAccount1, "234567019", "Password changed");
    });
    return test("PasswordValidator: valid password for another number", function() {
      return checkPassword(testAccount2, "986345012", "Password changed");
    });
  });

}).call(this);
