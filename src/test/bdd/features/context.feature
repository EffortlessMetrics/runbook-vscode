Feature: Context Collection
  As a Runbook daemon
  I need to receive telemetry about the user's workspace and git branch
  So that I can pass accurate context to the Claude agent

  Scenario: Workspace path is exposed
    Then the workspace folder list should be accessible
    And the context collector should not crash when reading git branch

  Scenario: Active terminal context is reported
    Given I have no terminals open
    When I create a terminal named "context-agent"
    And I focus terminal "context-agent"
    Then the extension should be tracking the active terminal index
