Feature: Login with a existing user

Scenario: The user is already registered in the system
  Given A registered user
  When I fill the data in the form and press sign in
  Then I should be redirect to the homepage