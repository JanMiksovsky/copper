###
Handle requests to send email.

This sends SMTP messages via nodemailer (https://github.com/andris9/Nodemailer).
###

nodemailer = require "nodemailer"

class EmailHandler

  # Handle a request to send email.
  # One place this is used is during the citizen registration process.
  #
  # TODO: Don't require/allow client to specify recipient email address, because
  # that could be abused. Instead, obtain email address from player account.
  #
  @handleMessageRequest: ( request, response ) ->
    { template, email } = request.params
    # console?.log "Sending #{template} message to #{email}"
    message = @templates[ template ]
    message.to = email
    @smtpTransport.sendMail message, ( error, result ) =>
      confirmation = {}
      if error
        confirmation.sent = false
        confirmation.error = error
      else
        confirmation.sent = true
      response.send confirmation

  # Create reusable transport method (opens pool of SMTP connections).
  @smtpTransport: nodemailer.createTransport( "SMTP",
    service: "Gmail"
    auth:
      user: "copper.mailer@gmail.com"
      pass: "copper.mailer"
  )

  @templates:
    intro:
      from: "Ann Williams <ann.williams@facebook.com>" # sender address
      subject: "Not quite sure about the Dept. of Unified Protection" # Subject line
      html: """
      <div style="font-family: Helvetica, Arial, sans-serif; font-size: 10pt;">
      <p>
      It looks like you registered on that Department of Unified Protection site.
      </p>
      <p>
      I don't want to freak you out, but that agency may be prioritizing
      "security" over the needs of the average person. People in a number of
      cities are reporting odd actions that have been undertaken by the D.U.P, and
      some of that activity seems pretty suspicious.
      </p>
      <p>
      Since you don't live too far away, I thought I'd give you a heads up. Until
      we can all find out more, I'd avoid cooperating with them.
      </p>
      <p>
      A concerned neighbor,
      </p>
      <p>
      Ann Williams<br/>
      Bellevue, WA
      </p>
      <p>
      <a href="http://apps.facebook.com/400736616662108">Find me on Facebook</a>
      </p>
      </div>
      """
