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
    And all interactive elements should have data-cy tags

  Scenario: Validation errors for empty fields
    Given I am on the login page
    When I click the submit button without filling fields
    Then I should see the email error message
    And I should see the password error message

  Scenario: Validation error for invalid email
    Given I am on the login page
    When I fill email with "not-an-email"
    And I click the submit button
    Then I should see the email error message

  Scenario: Validation error for short password
    Given I am on the login page
    When I fill email with "user@test.com"
    And I fill password with "123"
    And I click the submit button
    Then I should see the password error message

  Scenario: Global error on invalid credentials
    Given I am on the login page
    When I fill email with "wrong@test.com"
    And I fill password with "wrongpass"
    And I click the submit button
    Then I should see the global error message

  Scenario: Block UI after 5 failed attempts
    Given I am on the login page
    When I attempt login 5 times with wrong credentials
    Then the submit button should be disabled
    And I should see the blocked message
    And I should see the countdown timer
