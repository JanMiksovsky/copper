class window.ChatterBot

  # Find the best (first match).
  # The last pattern should always match anything, so this should always
  # return a match.
  @bestMatch: ( s ) ->
    for pattern in @patterns
      match = pattern.input.exec s
      if match?
        return { pattern, match }

  @respond: ( input ) ->
    { pattern, match } = @bestMatch input
    responses = pattern.output
    response = if $.isArray responses
      responses[ Math.floor responses.length * Math.random() ]
    else
      responses # Only one response
    captures = match.slice 1
    for capture, index in captures
      placeholder = "$#{index + 1}"
      response = response.replace placeholder, capture
    response

  @test: ->
    console?.log @respond "I need help."

ChatterBot.patterns = [
  input: /.*(s|S)ubway.*/
  output:
    # TODO: Use player's name.
    """
    Ah, that totally makes sense! At one of the rallys, we met a guy who works
    there. Can you go there and talk to him? The only name we have for
    him is, "Peacock".
    """
,
  input: /.*(h|H)ello.*/
  output: "Greetings."
,
  input: /^I (?:wish |would like )(?:I could |I was able to |to be able to )(.*)\./
  output: "What would it be like to be able to $1?"
,
  input: /I need (.*)\./
  output: [
    "Why do you need $1?"
    "Would it really help you to get $1?"
    "Are you sure you need $1?"
  ]
,
  input: /^When(.*) stole (.*)\./
  output: [
    "What happened when $2 was stolen?"
    "And how did you feel then?"
    "Was $2 ever found?"
  ]
,
  input: /Id really like to (.*)\./
  output: [
    "If you had the chance to $1, what would happen next?"
    "Well then, I hope you get to $1."
  ]
,
  input: /Why don't you (.*?)[\?]/
  output: [
    "Do you really think I don't $1?"
    "Perhaps eventually I will $1."
    "Do you really want me to $1?"
  ]
,
  input: /Why can't I (.*?)[\?]/
  output: [
    "Do you think you should be able to $1?"
    "If you could $1, what would you do?","I don't know -- why can't you $1?"
    "Have you really tried?"
  ]
,
  input: /I can't (.*) you\./
  output: [
    "How do you know you can't $1 me?"
    "Perhaps you could $1 me if you tried."
    "What would it take for you to $1 me?"
  ]
,
  input: /I can't (.*)\./
  output: [
    "How do you know you can't $1?"
    "Perhaps you could $1 if you tried."
    "What would it take for you to $1?"
  ]
,
  input: /Are you (.*?)[\?]/
  output: [
    "Why does it matter whether I am $1?"
    "Would you prefer it if I were not $1?"
    "Perhaps you believe I am $1."
    "I may be $1 -- what do you think?"
  ]
,
  input: /What (.*?)[\?]/
  output: [
    "Why do you ask?"
    "How would an answer to that help you?"
    "What do you think?"
  ]
,
  input: /How (.*?)[\?]/
  output: [
    "How do you suppose?"
    "Perhaps you can answer your own question."
    "What is it you're really asking?"
  ]
,
  input: /Because (.*)\./
  output: [
    "Is that the real reason?", "What other reasons come to mind?"
    "Does that reason apply to anything else?"
    "If $1, what else must be true?"
  ]
,
  input: /(.*) sorry (.*)\./
  output: [
    "What feelings do you have when you apologize?"
    "There are many times when no apology is needed."
  ]
,
  input: /I think (.*)\./
  output: [
    "Do you doubt $1?"
    "Do you really think so?"
    "But you're not sure $1?"
  ]
,
  input: /(.*) friend(.*)\./
  output: [
    "Tell me more about your friends."
    "When you think of a friend, what comes to mind?"
    "Why don't you tell me about a childhood friend?"
  ]
,
  input: /Yes\./
  output: [
    "You seem quite sure."
    "OK, but can you elaborate a bit?"
  ]
,
  input: /(.*) computer(.*)\./
  output: [
    "Are you really talking about me?"
    "Does it seem strange to talk to a computer?"
    "How do computers make you feel?"
    "Do you feel threatened by computers?"
  ]
,
  input: /Is it (.*?)[\?]/
  output: [
    "Do you think it is $1?"
    "Perhaps its $1 -- what do you think?"
    "If it were $1, what would you do?"
    "It could well be that $1."
  ]
,
  input: /It is (.*)\./
  output: [
    "You seem very certain."
    "If I told you that it probably isnt $1, what would you feel?"
  ]
,
  input: /Can you (.*) (me |me$).*\?/
  output: [
    "Of course I can $1 you."
    "Why wouldnt I be able to $1 you?"
  ]
,
  input: /Can you (.*?)[\?]/
  output: [
    "What makes you think I can't $1?"
    "If I could $1, then what?"
    "Why do you ask if I can $1?"
  ]
,
  input: /Can I (.*?)[\?]/
  output: [
    "Perhaps you don't want to $1."
    "Do you want to be able to $1?"
    "If you could $1, would you?"
  ]
,
  input: /You are (.*)\./
  output: [
    "Why do you think I am $1?"
    "Does it please you to think that I'm $1?"
    "Perhaps you would like me to be $1."
    "Perhaps you're really talking about yourself?"
  ]
,
  input: /you're (.*)\./
  output: [
    "Why do you say I am $1?"
    "Why do you think I am $1?", "Are we talking about you, or me?"
  ]
,
  input: /I don't (.*)\./
  output: [
    "don't you really $1?"
    "Why don't you $1?"
    "Do you want to $1?"
  ]
,
  input: /I feel (.*)\./
  output: [
    "Good, tell me more about these feelings."
    "Do you often feel $1?"
    "When do you usually feel $1?"
    "When you feel $1, what do you do?"
  ]
,
  input: /I have (.*)\./
  output: [
    "Why do you tell me that youve $1?"
    "Have you really $1?"
    "Now that you have $1, what will you do next?"
  ]
,
  input: /I would (.*)\./
  output: [
    "Could you explain why you would $1?"
    "Why would you $1?"
    "Who else knows that you would $1?"
  ]
,
  input: /Is there (.*?)[\?]/
  output: [
    "Do you think there is $1?"
    "Its likely that there is $1."
    "Would you like there to be $1?"
  ]
,
  input: /My (.*)\./
  output: [
    "I see, your $1."
    "Why do you say that your $1?"
    "When your $1, how do you feel?"
  ]
,
  input: /^You (.*)\./
  output: [
    "We should be discussing you, not me."
    "Why do you say that about me?"
    "Why do you care whether I $1?"
  ]
,
  input: /Why (.*)\?/,
  output: [
    "Why do you think $1?"
    "Why don't you tell me the reason why $1?"
  ]
,
  input: /I want (.*)\./
  output: [
    "Why do you want $1?"
    "What would it mean to you if you got $1?"
    "What would you do if you got $1?"
    "If you got $1, then what would you do?"
  ]
,
  input: /.*( the highway| the road).*/
  output: [
    "The highway is for gamblers, you better use your sense."
  ]
,
  input: /(.*) mother(.*)\./
  output: [
    "What was your relationship with your mother like?",
    "How do you feel about your mother?"
    "Tell me more about your mother."
    "How does this relate to your feelings today?"
    "Good family relations are important."
  ]
,
  input: /(.*) father(.*)\./
  output: [
    "Tell me more about your father."
    "How did your father make you feel?"
    "How do you feel about your father?"
    "Does your relationship with your father relate to your feelings today?"
    "Do you have trouble showing affection with your family?"
  ]
,
  input: /(.*) child(.*)\./
  output: [
    "Did you have close friends as a child?"
    "What is your favorite childhood memory?"
    "Do you remember any dreams or nightmares from childhood?"
    "Did the other children sometimes tease you?"
    "How do you think your childhood experiences relate to your feelings today?"
  ]
,
  input: /(.*) your fav(o|ou)rite(.*?)[\?]/
  output: [
    "I really don't have a favorite."
    "I have so many favorites its hard to choose one."
  ]
,
  input: /(.*?)[\?]/
  output: [
    "Hmm, not sure I know..."
    "That's a good question..."
    "Not sure I can answer that..."
    "Why do you ask that?"
    "Why don't you tell me?"
  ]
,
  input: /(.*)/
  output: [
    "Do you have any hobbies?",
    "I see, please continue..."
    "What exactly are we talking about?"
    "Can you go over that again please?"
    "Um, I get the feeling this conversation is not going anywhere."
    "yeah?"
    "hmm, is that so..."
    "Please tell me more."
    "Let's change focus a bit... Tell me about your family."
    "Can you elaborate on that?"
    "I see."
    "Very interesting."
    "I see.  And what does that tell you?"
    "How does that make you feel?"
    "How do you feel when you say that?"
  ]
]