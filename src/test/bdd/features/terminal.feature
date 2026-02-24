Feature: Terminal Management
  As a Runbook daemon
  I want to be able to cycle and interact with VS Code terminals deterministically
  So that I can control my agent loop without focus heuristics

  Scenario: Creating and listing terminals
    Given I have no terminals open
    When I create a terminal named "claude-agent-1"
    Then the terminal list should contain at least 1 terminal
    And the terminal "claude-agent-1" should exist
