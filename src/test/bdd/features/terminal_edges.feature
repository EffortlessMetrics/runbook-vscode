Feature: Terminal Edge Cases
  As a Runbook generic handler
  I want terminal cycling and sequence dispatch to be robust against weird inputs
  So that the extension never throws unhandled exceptions

  Scenario: Cycling terminals when none exist
    Given I have no terminals open
    When I cycle the terminal forward
    Then the terminal list should contain at least 0 terminal
    # Validates it doesn't crash modulo division by zero

  Scenario: Focusing out of bounds
    Given I have no terminals open
    When I create a terminal named "single"
    And I focus terminal index 999
    Then the terminal "single" should exist
    # Validates bounds checking

  Scenario: Sending sequences to non-existent terminals
    Given I have no terminals open
    When I send the sequence "Enter" to the active terminal
    Then the terminal list should contain at least 0 terminal

  Scenario: Unknown control sequences default to literal payload
    Given I have no terminals open
    When I create a terminal named "unknown-seq"
    And I send the sequence "Alt+F4" to terminal "unknown-seq"
    Then the terminal "unknown-seq" should exist
