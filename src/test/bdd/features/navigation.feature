Feature: Terminal Navigation
  As a Runbook operator using the dial and roller
  I want to cycle terminals deterministically and scroll evidence
  So that I can navigate agent output without mouse or guessing

  Scenario: Creating multiple terminals and verifying count
    Given I have no terminals open
    When I create a terminal named "agent-1"
    And I create a terminal named "agent-2"
    And I create a terminal named "agent-3"
    Then the terminal list should contain at least 3 terminal

  Scenario: All created terminals are independently addressable
    Given I have no terminals open
    When I create a terminal named "nav-a"
    And I create a terminal named "nav-b"
    Then the terminal "nav-a" should exist
    And the terminal "nav-b" should exist

  Scenario: Focusing a specific terminal by name
    Given I have no terminals open
    When I create a terminal named "focus-target"
    And I focus terminal "focus-target"
    Then the terminal "focus-target" should exist
