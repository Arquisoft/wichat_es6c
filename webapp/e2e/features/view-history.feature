Feature: View the history of a registered user

Scenario: Viewing history as a registered user
    Given a logged-in user on the homepage
    When the user clicks on "PROFILE"
    Then the user's history should be displayed