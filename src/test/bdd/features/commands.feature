Feature: Command Execution
  As a Runbook operator
  I want the registered VS Code commands to execute safely
  So that I can trigger extension behaviors manually via the command palette

  Scenario: Explicitly dispatching a test payload
    Given I have no terminals open
    When I create a terminal named "command-test"
    And I execute the VS Code command "runbook.dispatchTest"
    Then the terminal "command-test" should exist

  Scenario: Disconnecting and reconnecting manually
    Given the extension is active
    When I execute the VS Code command "runbook.disconnect"
    And I execute the VS Code command "runbook.connect"
    Then the extension should remain stable
