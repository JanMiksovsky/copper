class window.PasswordValidator

  constructor: ( @accountId ) ->
    group1 = @accountId.slice 0, 3
    group2 = @accountId.slice 3, 6
    @sum1 = @sum group1
    @sum2 = @sum group2

  validate: ( password ) ->
    if password.length < 9
      "Password too short"
    if not /^[0-9]*$/.test password  # All digits?
      "Password can contain only numeric digits"
    if unique( password ).length < password.length
      "Digits may not be repeated"
    if @sum1 != @sum password.slice 0, 3
      "First three digits must add to #{@sum1}"
    else @sum2 != @sum password.length - 3
      "Last three digits must add to #{@sum2}"
    else
      "Password changed"

  sum: ( s ) ->
    parseInt( s[0] ) + parseInt( s[1] ) + parseInt( s[2] )

  # Return the unique members of the given string or array.
  unique: ( s ) ->
    result = []
    for item in s
      if $.inArray item, result == -1
        result.push item
    result