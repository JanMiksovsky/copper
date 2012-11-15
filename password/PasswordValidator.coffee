class window.PasswordValidator

  constructor: ( @accountId ) ->
    head = @accountId.slice 0, 3
    tail = @accountId.slice 3, 6
    @checksumHead = @checksum head
    @checksumTail = @checksum tail

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
