###
File system
###

window.files =
  
  bin: {}
  
  etc: {}

  usr:
    # These are just placeholder accounts using suckerpunch.com email addresses.
    # These account names should be changed to be consistent. E.g., if Colin's
    # account is colin9sf82 -- a name and then some alphanumerics -- then most
    # or all of the accounts should follow suit. It might be fun to preserve the
    # (first) names of Sucker Punch employees as the agent names. In that case,
    # it'd be good to update this set at some point with a fuller list of Sucker
    # Punch employee names.
    adrianb: {}
    andrewk: {}
    andreww: {}
    andym: {}
    andyx: {}
    billro: {}
    billyh: {}
    bradm: {}
    brentt: {}
    brianf: {}
    bruceo: {}
    chrishe: {}
    christopherb: {}
    chrisz: {}
    colin9sf82: {}
    danaa: {} # Dana Anderson's account
    dannyw: {}
    darrenb: {}
    davem: {}
    davidm: {}
    dongjoonl: {}
    edwardp: {}
    emiliog: {}
    gailo: {}
    gregt: {}
    haroldl: {}
    horiad: {}
    isaiahs: {}
    jaimeg: {}
    jamesm: {}
    jancea: {}
    # TODO: Remove these test files. Alternatively, turn these into the folders
    # the DUP contractor (Harry) was working on. This would give players a set
    # of simple files to explore before heading off to find the secret plans in
    # the account of another agent (Colin).
    janm:
      bar: "Bar\n"
      "fact.dup": "[$1>[$1-f*][%1]?]⇒f f."
      foo: "Foo\n"
      "foo.dup": "1 1+."
      "ftoc.dup": "32- 9/\\% 5* ."
      google: "http://google.com"
      maze: "-> /usr/colin9sf82"
      "pop.dup": "."
    jasminp: {}
    jasonc: {}
    jasons: {}
    jefff: {}
    jeffl: {}
    jeffm: {}
    joannaw: {}
    johng: {}
    johnh: {}
    joshj: {}
    joshr: {}
    kens: {}
    leae: {}
    liannec: {}
    lukes: {}
    mattd: {}
    mattl: {}
    mattv: {}
    maxc: {}
    mdhaynes: {}
    michaelm: {}
    mikeg: {}
    mikeh: {}
    morganh: {}
    natef: {}
    nathanr: {}
    parkerh: {}
    philo: {}
    rameyh: {}
    ranjith: {}
    rickb: {}
    rickl: {}
    romanm: {}
    scottw: {}
    seans: {}
    shahbaaz: {}
    shannonl: {}
    sofiew: {}
    soniaj: {}
    sooyunj: {}
    spencera: {}
    stephenw: {}
    stevei: {}
    susanl: {}
    tedf: {}
    teresab: {}
    tobyt: {}
    tomm: {}
    tyk: {}
    willh: {}
    williamr: {}


###
Maze puzzle in Dana's folder.
###
window.files.usr.colin9sf82 =
  plans:
    round1:
      copy: "-> /usr/colin9sf82/plans-review/copy"
    round2:
      plans2: "-> /usr/colin9sf82/plans2"
  plans2:
    plans: "-> /usr/colin9sf82/plans"
    review: "-> /usr/colin9sf82/plans-review/plans"
  "plans-review":
    copy:
      latest: "-> /usr/colin9sf82/plans/round2"
    plans:
      "final": "-> /usr/colin9sf82/plans-review/plans-final-FINAL"
    "plans-final":
      "for-review": "-> /usr/colin9sf82/plans/round2"
    "plans.copy":
      round1:
        plans: "-> /usr/colin9sf82/plans/round1"
        round2:
          secret: """
            Congratulations, you have found the super-secret file!

          """
      original: "-> /usr/colin9sf82/plans2/plans"
    "plans-final-FINAL": "-> /usr/colin9sf82/plans-review/plans-final"
  readme:
    """
    Ugh, where the hell is the final plan?
    When I find the idiot who created these files, I'm going to make sure they
    die a slow death.

    -Dana

    """
