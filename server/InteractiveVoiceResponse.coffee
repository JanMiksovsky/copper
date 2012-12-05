###
Handles requests to the Angel.com IVR (Interactive Voice Response) system.
###

PasswordValidator = ( require "./build/password.js" ).PasswordValidator

class InteractiveVoiceResponse

  # Construct an AngelXML response
  @angelXmlResponse: ( message, destination ) ->
    xml = @passwordResponse
    xml = xml.replace "{{message}}", message
    xml = xml.replace "{{destination}}", destination
    xml

  @verify: ( request, response ) ->

    { phone, password } = request.query
    console?.log "Verifying password #{password} for phone #{phone}"

    if phone? and password?
      validator = new PasswordValidator phone
      message = validator.validate password
    else
      # Bad request
      message = "A system problem has occurred."

    destination = if message == "Password changed"
      # Player solved the puzzle
      @pageNumbers.passwordChanged
    else
      # Let player try again
      @pageNumbers.enterNewPassword

    xml = @angelXmlResponse message, destination
    response.set "Content-Type", "text/xml"
    response.send xml

  # Response to Angel.com using AngelXML
  # See https://www.socialtext.net/ivrwiki/transaction_page_reference_guide
  @passwordResponse:
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

  # "Page numbers" on the hosted Angel.com IVR.
  # These are effectively ID numbers for steps in the IVR flow.
  @pageNumbers:
    passwordChanged: 4
    enterNewPassword: 5