Feature: Playing a game

Scenario: A registered user starts a new game
  Given A logged user in play view
  When I press "PLAY" and select normal game option "Países"
  Then A new game starts and the user can play