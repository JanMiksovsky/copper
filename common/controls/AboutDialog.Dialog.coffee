###
A dialog that explains Copper is a game.
This is invoked by the "What's This?" buttons on many Copper pages.
###

class window.AboutDialog extends Dialog

  inherited:    
    cancelOnOutsideClick: true
    closeOnInsideClick: true
    content:
      """
      <h1>This is a game</h1>
      <p>
      This game is produced by [SCEA?] and [more legalese here].
      All characters appearing in this work are fictitious. Any resemblance
      to real persons, living or dead, is purely coincidental.
      </p>
      """
    width: "500px"