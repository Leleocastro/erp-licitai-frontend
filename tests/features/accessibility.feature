Feature: Accessibility
  As a user with accessibility needs
  I want the application to be accessible
  So that I can use it with assistive technologies

  Scenario: Login page has no accessibility violations
    Given I am on the login page
    Then the page should have no WCAG violations

  Scenario: Login form inputs have aria-invalid on error
    Given I am on the login page
    When I click the submit button without filling fields
    Then the email input should have aria-invalid
    And the password input should have aria-invalid

  Scenario: Login form inputs have aria-describedby
    Given I am on the login page
    When I click the submit button without filling fields
    Then the email input should have aria-describedby
    And the password input should have aria-describedby
