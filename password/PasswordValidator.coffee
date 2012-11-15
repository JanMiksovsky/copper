class window.PasswordValidator

  constructor: ( @accountId ) ->
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

  checksum: ( s ) ->
    parseInt( s[0] ) + parseInt( s[1] ) + parseInt( s[2] )

  # Hash a numeric account ID into the numeric trigram space
  hash: ( accountId ) ->
    parseInt( accountId ) % @possibleTrigrams

  nthTrigram: ( n ) ->
    dividend = n
    digits = "0123456789"
    trigram = ""
    for divisor in [ 9 * 8, 8, 1 ]
      quotient = Math.floor dividend / divisor
      digit = digits[ quotient ]
      trigram += digit # Add digit to trigram
      digits = digits.replace digit, "" # Remove the digit from consideration
      remainder = dividend % divisor
      dividend = remainder
    trigram

  # Count of permutations of 3 digits
  possibleTrigrams: 10 * 9 * 8
