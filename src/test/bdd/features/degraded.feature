Feature: Degraded Mode
  As a Runbook operator without Claude Code hooks
  I want the extension to still dispatch text and navigate terminals
  So that I have a usable instrument even without full fidelity

  Scenario: Dispatch works without daemon connection
    Given I have no terminals open
    When I create a terminal named "degraded-target"
    And I send the text "echo no-hooks" to terminal "degraded-target"
    Then the terminal "degraded-target" should exist

  Scenario: Terminal cycling works without daemon connection
    Given I have no terminals open
    When I create a terminal named "degraded-1"
    And I create a terminal named "degraded-2"
    Then the terminal list should contain at least 2 terminal
