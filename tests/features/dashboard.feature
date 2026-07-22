Feature: Dashboard
  As an authenticated user
  I want to access the dashboard
  So that I can manage the system

  Scenario: Sidebar displays Core module active
    Given I am logged in
    And I am on the dashboard
    Then I should see the sidebar navigation
    And the Usuarios link should be active
    And I should see the Orgaos link
    And I should see the Roles link

  Scenario: Route protection redirects unauthenticated users
    Given I am not logged in
    When I try to access "/core/usuarios"
    Then I should be redirected to the login page

  Scenario: Logout clears session and redirects
    Given I am logged in
    And I am on the dashboard
    When I click the logout button
    Then I should be redirected to the login page
    And my session should be cleared
