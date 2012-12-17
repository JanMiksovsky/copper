###
Deals with selecting random fake "suspects".
###

class window.FakeSuspects

  # Return the given number of random suspects, taking care to avoid names
  # that are also names in the list of friends.
  @select: ( count, friends ) ->
    selected = []
    suspects = Utilities.shuffle @_suspects
    for suspect in suspects
      friendHasName = ( @_friendWithName suspect.name, friends )?
      unless friendHasName
        selected.push suspect
        if selected.length >= count
          return selected # Have enough
    selected # Got less than count, but return what we got.

  # Return the friend exist with the given name.
  @_friendWithName: ( name, friends ) ->
    for friend in friends
      if friend.name == name
        return friend
    null

  @suspectWithId: ( id ) ->
    $.grep @_suspects, ( item ) =>
      item.id == id

  # Pool of fake suspects.
  @_suspects: [
    id: -1
    name: "Adolphus Lueilwitz"
    picture: "resources/pictures/male1.jpg"
  ,
    id: -2
    name: "Ara Stracke"
    picture: "resources/pictures/female1.jpg"
  ,
    id: -3
    name: "Brent Mueller"
    picture: "resources/pictures/male2.jpg"
  ,
    id: -4
    name: "Claudine Mraz"
    picture: "resources/pictures/female2.jpg"
  ,
    id: -5
    name: "Dalton Klocko"
    picture: "resources/pictures/male3.jpg"
  ,
    id: -6
    name: "Delmer Prosacco"
    picture: "resources/pictures/male4.jpg"
  ,
    id: -7
    name: "Dorian Kautzer"
    picture: "resources/pictures/female3.jpg"
  ,
    id: -8
    name: "Emanuel Prosacco"
    picture: "resources/pictures/male5.jpg"
  ,
    id: -9
    name: "Fermin Daniel"
    picture: "resources/pictures/male6.jpg"
  ,
    id: -10
    name: "Grant Kessler"
    picture: "resources/pictures/male7.jpg"
  ,
    id: -11
    name: "Ivah Hermiston"
    picture: "resources/pictures/female4.jpg"
  ,
    id: -12
    name: "Keith Hickle"
    picture: "resources/pictures/male8.jpg"
  ,
    id: -13
    name: "Landen Padberg"
    picture: "resources/pictures/male9.jpg"
  ,
    id: -14
    name: "Madison Welch"
    picture: "resources/pictures/female5.jpg"
  ,
    id: -15
    name: "Maybell Mraz"
    picture: "resources/pictures/female6.jpg"
  ,
    id: -16
    name: "Nicklaus Stark"
    picture: "resources/pictures/male10.jpg"
  ,
    id: -17
    name: "Octavia Yundt"
    picture: "resources/pictures/female7.jpg"
  ,
    id: -18
    name: "Sally Swaniawski"
    picture: "resources/pictures/female8.jpg"
  ,
    id: -19
    name: "Tina Schneider"
    picture: "resources/pictures/female9.jpg"
  ,
    id: -20
    name: "Zita Dach"
    picture: "resources/pictures/female10.jpg"
  ]
