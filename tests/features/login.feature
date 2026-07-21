Feature: Login
  As a user
  I want to login to the system
  So that I can access the dashboard

  Scenario: Login page displays correctly
    Given I am on the login page
    Then I should see the login form
    And I should see the email input
    And I should see the password input
    And I should see the submit button
