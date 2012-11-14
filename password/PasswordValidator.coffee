class window.PasswordValidator

  constructor: ( @hash ) ->
    group1 = @hash.slice 0, 3
    group2 = @hash.slice 3, 6
    @sum1 = @sum group1
    @sum2 = @sum group2

  validate: ( password ) ->
    first = password.slice 0, 3
    last = password.slice password.length - 3
    sumFirst = @sum first
    sumLast = @sum last
    if sumFirst != @sum1
      "First three digits must add to #{@sum1}"
    else if sumLast != @sum2
      "Last three digits must add to #{@sum2}"
    else
      "Password changed"

  sum: ( s ) ->
    parseInt( s[0] ) + parseInt( s[1] ) + parseInt( s[2] )