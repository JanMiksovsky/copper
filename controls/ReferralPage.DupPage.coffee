class window.ReferralPage extends DupPage

  inherited:
    content: [
      """<p>
      Identify one of the following:
      </p>"""
      { control: List, ref: "suspectList", itemClass: "SuspectTile" }
    ]
    title: "Citizen Watch Program"

  # Create a lineup using a randomly selected friend plus some random suspects.
  createLineup: ( friends ) ->
    suspects = @pickSuspects friends
    @$suspectList().items suspects

  friendWithName: ( name, friends ) ->
    for friend in friends
      if friend.name == name
        return friend
    null

  initialize: ->
    Math.seedrandom()
    Facebook.currentUser ( data ) =>
      console?.log data.name
      Facebook.currentUserFriends ( data ) =>
        @createLineup data

  pickSuspects: ( friends ) ->
    friendIndex = Math.floor Math.random() * friends.length
    friend = friends[ friendIndex ]
    suspects = @randomSuspects 3, friends
    suspects.push friend.name
    suspects

  randomSuspect: ( pool, friends ) ->
    available = false
    until available
      index = Math.floor Math.random() * pool.length
      name = pool[ index ]
      friend = @friendWithName name, friends
      available = friend is null
    { index, name }

  # Return the given number of random suspects, taking care to avoid names
  # that are also names in the list of friends.
  # TODO: Handle pathological cases.
  randomSuspects: ( count, friends ) ->
    suspects = []
    pool = ReferralPage._suspects.slice() # Copy
    for i in [ 0 .. count - 1 ]
      { index, name } = @randomSuspect pool, friends
      suspects.push name
      pool.splice index, 1 # Remove the suspect from the pool
    suspects

  # Collection of random generated names used for the other suspects.
  @_suspects: [
    "Adolphus Lueilwitz"
    "Alene O'Keefe"
    "Allan Labadie"
    "Alvena D'Amore"
    "Antonette Klein"
    "Ara Stracke"
    "Arlene Altenwerth"
    "Bethel Weimann"
    "Brendon Hoppe"
    "Brenna Schulist"
    "Brent Mueller"
    "Brigitte Hudson"
    "Casey Mayer"
    "Cassandre Langosh"
    "Clara Cruickshank"
    "Claudine Mraz"
    "Cleora Carter"
    "Connie Padberg"
    "Connie Schamberger"
    "Cornelius Beer"
    "Dalton Klocko"
    "Daren Nicolas"
    "Dedrick Hammes"
    "Dejon Kilback"
    "Della McCullough"
    "Delmer Prosacco"
    "Derrick Wiza"
    "Deshaun Smitham"
    "Desmond Hermiston"
    "Donnell Robel"
    "Dorian Kautzer"
    "Eden Effertz"
    "Eleazar Huels"
    "Eloisa Dicki"
    "Elton Reinger"
    "Emanuel Prosacco"
    "Emilie Parisian"
    "Ephraim Bosco"
    "Faye Vandervort"
    "Felipe Borer"
    "Fermin Daniel"
    "Floy Block"
    "Freda Breitenberg"
    "Garnett Green"
    "Gaylord Littel"
    "Grant Kessler"
    "Guadalupe Borer"
    "Hailee Stiedemann"
    "Haylie Hammes"
    "Isac Bayer"
    "Ivah Hermiston"
    "Jakayla Koepp"
    "Jaquelin Volkman"
    "Jarrett Schneider"
    "Johanna Harris"
    "Keith Hickle"
    "Koby Morissette"
    "Kurt Hahn"
    "Lacey Shields"
    "Lacy Ernser"
    "Landen Padberg"
    "Layne Ferry"
    "Lou Kilback"
    "Lurline Hudson"
    "Luz Funk"
    "Madison Welch"
    "Maria Rath"
    "Marianne Bahringer"
    "Maudie Gerlach"
    "Mavis Adams"
    "Maybell Mraz"
    "Megane Reichel"
    "Milford Emard"
    "Mona D'Amore"
    "Monte Stark"
    "Nicklaus Stark"
    "Nicole Hagenes"
    "Noble Simonis"
    "Norbert Padberg"
    "Norene Harber"
    "Octavia Yundt"
    "Onie Altenwerth"
    "Oscar Stroman"
    "Prince Hermiston"
    "Retha Schuster"
    "Sally Swaniawski"
    "Santina Carroll"
    "Sarah Ratke"
    "Shania Grant"
    "Simone Volkman"
    "Sydney Dickens"
    "Tia Stehr"
    "Tina Schneider"
    "Trevion Fisher"
    "Velva Rempel"
    "Waino Halvorson"
    "Willard Ritchie"
    "Yvette Zulauf"
    "Zachariah Johns"
    "Zita Dach"
  ]