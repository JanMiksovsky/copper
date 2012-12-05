###
Handles requests to the Angel.com IVR (Interactive Voice Response) system.
###

PasswordValidator = ( require "./build/password.js" ).PasswordValidator

class InteractiveVoiceResponse

  # Construct an AngelXML response
  @angelXmlResponse: ( message, destination ) ->
    xml = @xmlResponseTemplate
    xml = xml.replace "{{message}}", message
    xml = xml.replace "{{destination}}", destination
    xml


  # Verify an attempt to change a password.
  @verifyPassword: ( request, response ) ->

    { phone, password } = request.query
    console?.log "Verifying password #{password} for phone #{phone}"

    if phone? and password?
      validator = new PasswordValidator phone
      message = validator.validate password
    else
      # Bad request
      message = "A system problem has occurred."

    destination = if message == "Your password has been changed."
      # Player solved the puzzle
      @pageNumbers.passwordChanged
    else
      # Let player try again
      @pageNumbers.enterNewPassword

    response.set "Content-Type", "text/xml"
    response.send @angelXmlResponse message, destination


  # Verify an incoming phone number for use on the IVR.
  @verifyPhone: ( request, response ) ->

    { phone } = request.query
    console?.log "Verifying phone #{phone}"
    # TODO: Look up the contents of the phone variable in player database and
    # verify that it's associated with a player.
    valid = true
    if valid
      destination = @pageNumbers.greeting
    else
      destination = @pageNumbers.unknownPhone
    message = ""

    response.set "Content-Type", "text/xml"
    response.send @angelXmlResponse message, destination


  # "Page numbers" on the hosted Angel.com IVR.
  # These are effectively ID numbers for steps in the IVR flow.
  @pageNumbers:
    greeting: 1
    passwordChanged: 4
    enterNewPassword: 5
    unknownPhone: 11

  # Template for AngelXML responses to requests from Angel.com.
  # See https://www.socialtext.net/ivrwiki/transaction_page_reference_guide
  @xmlResponseTemplate:
    """
    <ANGELXML>
      <MESSAGE>
        <PLAY>
          <PROMPT type="text">
            {{message}}
          </PROMPT>
        </PLAY>
        <GOTO destination="/{{destination}}" />
      </MESSAGE>
    </ANGELXML>
    """