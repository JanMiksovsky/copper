###
Templates for email messages, web pages, etc.
###

templates =

  introMessage:
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
