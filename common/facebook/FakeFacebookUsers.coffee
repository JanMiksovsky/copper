###
Database of fake Facebook users.
These are all identified with negative ID numbers.
###

window.fakeFacebookUsers =

  "-1":
    name: "Ann Williams"
    link: "timeline.html"
    picture: "resources/profilePhoto.jpg"
  "-2":
    name: "Cody Kuether"
    link: "PAGEGOESHERE"
    picture: "resources/pictures/male3.jpg"

# Give each fake user an id property
fakeUser.id = fakeUserId for fakeUserId, fakeUser of fakeFacebookUsers

# Our heroine
fakeFacebookUsers.heroine = fakeFacebookUsers[ "-1" ]