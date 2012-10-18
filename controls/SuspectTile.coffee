class window.SuspectTile extends Control

  inherited:
    content: [
      { html: "div", ref: "container", content: [
        { html: "img", ref: "picture" }
        { html: "div", ref: "identifier" }
        { html: "div", ref: "timestamp" }
      ]}
    ]

  identifier: Control.chain "$identifier", "content"

  initialize: ->

    # Choose a random identifier.
    identifier = Math.random() * 100000000000
    identifier = identifier.toString().replace ".", "-"
    @identifier identifier

    # Choose a random date in the past year to use a timestamp.
    date = new Date()
    date.setDate date.getDate() - Math.random() * 365
    date.setMinutes date.getMinutes() - Math.random() * 24 * 60
    y = date.getFullYear()
    m = @_padZero date.getMonth() + 1
    d = @_padZero date.getDate()
    h = @_padZero date.getHours()
    m = @_padZero date.getMinutes()
    s = @_padZero date.getSeconds()
    timestamp = "#{y}-#{m}-#{d} #{h}:#{m}:#{s}"
    @timestamp timestamp

    @click =>
      if @suspect().isFriend
        alert "You lose karma because you implicated a friend."
      else
        alert "You lose karma because you implicated an innocent stranger."

  picture: Control.chain "$picture", "prop/src"

  suspect: Control.property ( suspect ) ->
    @picture suspect.picture

  timestamp: Control.chain "$timestamp", "content"

  _padZero: ( n ) ->
    ( "0" + n ).substr -2, 2