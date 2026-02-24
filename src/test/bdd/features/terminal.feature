Feature: Terminal Management
  As a Runbook daemon
  I want to be able to cycle and interact with VS Code terminals deterministically
  So that I can control my agent loop without focus heuristics

  Scenario: Creating a single terminal
    Given I have no terminals open
    When I create a terminal named "claude-agent-1"
    Then the terminal list should contain at least 1 terminal
    And the terminal "claude-agent-1" should exist

  Scenario: Creating multiple terminals preserves all of them
    Given I have no terminals open
    When I create a terminal named "session-a"
    And I create a terminal named "session-b"
    And I create a terminal named "session-c"
    Then the terminal list should contain at least 3 terminal
    And the terminal "session-a" should exist
    And the terminal "session-b" should exist
    And the terminal "session-c" should exist

  Scenario: Terminals with duplicate names are individually tracked
    Given I have no terminals open
    When I create a terminal named "claude"
    And I create a terminal named "claude"
    Then the terminal list should contain at least 2 terminal

  Scenario: Disposing a terminal removes it from the list
    Given I have no terminals open
    When I create a terminal named "ephemeral"
    Then the terminal "ephemeral" should exist
    When I dispose terminal "ephemeral"
    Then the terminal "ephemeral" should not exist

  Scenario: Sending text to a specific terminal by name
    Given I have no terminals open
    When I create a terminal named "text-target"
    And I send the text "echo hello world" to terminal "text-target"
    Then the terminal "text-target" should exist

  Scenario: Sending text without newline
    Given I have no terminals open
    When I create a terminal named "partial-target"
    And I send the text "partial" to terminal "partial-target" without newline
    Then the terminal "partial-target" should exist
