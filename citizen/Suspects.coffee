###
Deals with selecting random "suspects".
###

class window.Suspects

  # Return the given number of random suspects, taking care to avoid names
  # that are also names in the list of friends.
  @select: ( count, friends ) ->
    selected = []
    suspects = Utilities.shuffle Suspects._suspects
    picturesFemale = Utilities.shuffle Suspects._picturesFemale
    picturesMale = Utilities.shuffle Suspects._picturesMale
    for suspect in suspects
      friendHasName = ( Suspects._friendWithName suspect.name, friends )?
      unless friendHasName
        picture = if suspect.gender == "male"
          picturesMale.shift()
        else
          picturesFemale.shift()
        selected.push
          name: suspect.name
          picture: picture
        if selected.length >= count
          return selected # Have enough
    selected # Got less than count, but return what we got.

  @_friendWithName: ( name, friends ) ->
    for friend in friends
      if friend.name == name
        return friend
    null

  @_picturesFemale: [
    "/copper/dup/resources/pictures/female1.jpg"
    "/copper/dup/resources/pictures/female2.jpg"
    "/copper/dup/resources/pictures/female3.jpg"
    "/copper/dup/resources/pictures/female4.jpg"
    "/copper/dup/resources/pictures/female5.jpg"
    "/copper/dup/resources/pictures/female6.jpg"
    "/copper/dup/resources/pictures/female7.jpg"
    "/copper/dup/resources/pictures/female8.jpg"
    "/copper/dup/resources/pictures/female9.jpg"
    "/copper/dup/resources/pictures/female10.jpg"
  ]

  @_picturesMale: [
    "/copper/dup/resources/pictures/male1.jpg"
    "/copper/dup/resources/pictures/male2.jpg"
    "/copper/dup/resources/pictures/male3.jpg"
    "/copper/dup/resources/pictures/male4.jpg"
    "/copper/dup/resources/pictures/male5.jpg"
    "/copper/dup/resources/pictures/male6.jpg"
    "/copper/dup/resources/pictures/male7.jpg"
    "/copper/dup/resources/pictures/male8.jpg"
    "/copper/dup/resources/pictures/male9.jpg"
    "/copper/dup/resources/pictures/male10.jpg"
  ]

  # Collection of random generated names used for the other suspects.
  @_suspects: [
    name: "Adolphus Lueilwitz", gender: "male"
  ,
    name: "Alene O'Keefe", gender: "female"
  ,
    name: "Allan Labadie", gender: "male"
  ,
    name: "Alvena D'Amore", gender: "female"
  ,
    name: "Antonette Klein", gender: "female"
  ,
    name: "Ara Stracke", gender: "female"
  ,
    name: "Arlene Altenwerth", gender: "female"
  ,
    name: "Bethel Weimann", gender: "female"
  ,
    name: "Brendon Hoppe", gender: "male"
  ,
    name: "Brenna Schulist", gender: "female"
  ,
    name: "Brent Mueller", gender: "male"
  ,
    name: "Brigitte Hudson", gender: "female"
  ,
    name: "Casey Mayer", gender: "female"
  ,
    name: "Cassandre Langosh", gender: "female"
  ,
    name: "Clara Cruickshank", gender: "female"
  ,
    name: "Claudine Mraz", gender: "female"
  ,
    name: "Cleora Carter", gender: "female"
  ,
    name: "Connie Padberg", gender: "female"
  ,
    name: "Connie Schamberger", gender: "female"
  ,
    name: "Cornelius Beer", gender: "male"
  ,
    name: "Dalton Klocko", gender: "male"
  ,
    name: "Daren Nicolas", gender: "male"
  ,
    name: "Dedrick Hammes", gender: "male"
  ,
    name: "Dejon Kilback", gender: "male"
  ,
    name: "Della McCullough", gender: "female"
  ,
    name: "Delmer Prosacco", gender: "male"
  ,
    name: "Derrick Wiza", gender: "male"
  ,
    name: "Deshaun Smitham", gender: "male"
  ,
    name: "Desmond Hermiston", gender: "male"
  ,
    name: "Donnell Robel", gender: "male"
  ,
    name: "Dorian Kautzer", gender: "female"
  ,
    name: "Eden Effertz", gender: "female"
  ,
    name: "Eleazar Huels", gender: "female"
  ,
    name: "Eloisa Dicki", gender: "female"
  ,
    name: "Elton Reinger", gender: "male"
  ,
    name: "Emanuel Prosacco", gender: "male"
  ,
    name: "Emilie Parisian", gender: "female"
  ,
    name: "Ephraim Bosco", gender: "male"
  ,
    name: "Faye Vandervort", gender: "female"
  ,
    name: "Felipe Borer", gender: "male"
  ,
    name: "Fermin Daniel", gender: "male"
  ,
    name: "Floy Block", gender: "male"
  ,
    name: "Freda Breitenberg", gender: "female"
  ,
    name: "Garnett Green", gender: "male"
  ,
    name: "Gaylord Littel", gender: "male"
  ,
    name: "Grant Kessler", gender: "male"
  ,
    name: "Guadalupe Borer", gender: "male"
  ,
    name: "Hailee Stiedemann", gender: "female"
  ,
    name: "Haylie Hammes", gender: "female"
  ,
    name: "Isac Bayer", gender: "male"
  ,
    name: "Ivah Hermiston", gender: "female"
  ,
    name: "Jakayla Koepp", gender: "female"
  ,
    name: "Jaquelin Volkman", gender: "female"
  ,
    name: "Jarrett Schneider", gender: "male"
  ,
    name: "Johanna Harris", gender: "female"
  ,
    name: "Keith Hickle", gender: "male"
  ,
    name: "Koby Morissette", gender: "male"
  ,
    name: "Kurt Hahn", gender: "male"
  ,
    name: "Lacey Shields", gender: "female"
  ,
    name: "Lacy Ernser", gender: "female"
  ,
    name: "Landen Padberg", gender: "male"
  ,
    name: "Layne Ferry", gender: "male"
  ,
    name: "Lou Kilback", gender: "male"
  ,
    name: "Lurline Hudson", gender: "female"
  ,
    name: "Luz Funk", gender: "female"
  ,
    name: "Madison Welch", gender: "female"
  ,
    name: "Maria Rath", gender: "female"
  ,
    name: "Marianne Bahringer", gender: "female"
  ,
    name: "Maudie Gerlach", gender: "female"
  ,
    name: "Mavis Adams", gender: "female"
  ,
    name: "Maybell Mraz", gender: "female"
  ,
    name: "Megane Reichel", gender: "female"
  ,
    name: "Milford Emard", gender: "male"
  ,
    name: "Mona D'Amore", gender: "female"
  ,
    name: "Monte Stark", gender: "male"
  ,
    name: "Nicklaus Stark", gender: "male"
  ,
    name: "Nicole Hagenes", gender: "female"
  ,
    name: "Noble Simonis", gender: "female"
  ,
    name: "Norbert Padberg", gender: "male"
  ,
    name: "Norene Harber", gender: "female"
  ,
    name: "Octavia Yundt", gender: "female"
  ,
    name: "Onie Altenwerth", gender: "male"
  ,
    name: "Oscar Stroman", gender: "male"
  ,
    name: "Prince Hermiston", gender: "male"
  ,
    name: "Retha Schuster", gender: "female"
  ,
    name: "Sally Swaniawski", gender: "female"
  ,
    name: "Santina Carroll", gender: "female"
  ,
    name: "Sarah Ratke", gender: "female"
  ,
    name: "Shania Grant", gender: "female"
  ,
    name: "Simone Volkman", gender: "female"
  ,
    name: "Sydney Dickens", gender: "male"
  ,
    name: "Tia Stehr", gender: "female"
  ,
    name: "Tina Schneider", gender: "female"
  ,
    name: "Trevion Fisher", gender: "male"
  ,
    name: "Velva Rempel", gender: "female"
  ,
    name: "Waino Halvorson", gender: "male"
  ,
    name: "Willard Ritchie", gender: "male"
  ,
    name: "Yvette Zulauf", gender: "female"
  ,
    name: "Zachariah Johns", gender: "male"
  ,
    name: "Zita Dach", gender: "female"
  ]
