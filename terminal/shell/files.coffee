###
File system
###

window.files =
  
  bin: {}
  
  etc: {}

  usr:
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
    janm:
      foo: "Foo\n"
      bar: "Bar\n"
      google: "http://google.com"
      maze: "-> /usr/danaa"
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
window.files.usr.danaa =
  plans:
    round1:
      copy: "-> /usr/danaa/plans-review/copy"
    round2:
      plans2: "-> /usr/danaa/plans2"
  plans2:
    plans: "-> /usr/danaa/plans"
    review: "-> /usr/danaa/plans-review/plans"
  "plans-review":
    copy:
      latest: "-> /usr/danaa/plans/round2"
    plans:
      "final": "-> /usr/danaa/plans-review/plans-final-FINAL"
    "plans-final":
      "for-review": "-> /usr/danaa/plans/round2"
    "plans.copy":
      round1:
        plans: "-> /usr/danaa/plans/round1"
        round2:
          secret: """
            Congratulations, you have found the super-secret file!

          """
      original: "-> /usr/danaa/plans2/plans"
    "plans-final-FINAL": "-> /usr/danaa/plans-review/plans-final"
  readme:
    """
    Ugh, where the hell is the final plan?
    When I find the idiot who created these files, I'm going to make sure they
    die a slow death.
    -D

    """
