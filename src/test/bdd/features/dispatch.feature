Feature: Prompt Dispatch Loop
  As a Runbook operator
  I want the two-gesture ARM then DISPATCH contract to be honored
  So that I never accidentally send a prompt to the agent

  Scenario: ARMED prompt terminal exists before dispatch
    Given I have no terminals open
    When I create a terminal named "claude-session"
    Then the terminal "claude-session" should exist

  Scenario: Dispatching text to a terminal
    Given I have no terminals open
    When I create a terminal named "dispatch-test"
    And I send the text "echo armed-dispatch" to terminal "dispatch-test"
    Then the terminal "dispatch-test" should exist

  Scenario: Dispatching Ctrl+C interrupt
    Given I have no terminals open
    When I create a terminal named "ctrl-test"
    And I send the sequence "Ctrl+C" to terminal "ctrl-test"
    Then the terminal "ctrl-test" should exist

  Scenario: Dispatching Esc to cancel
    Given I have no terminals open
    When I create a terminal named "esc-test"
    And I send the sequence "Esc" to terminal "esc-test"
    Then the terminal "esc-test" should exist

  Scenario: Dispatching Enter to confirm
    Given I have no terminals open
    When I create a terminal named "enter-test"
    And I send the sequence "Enter" to terminal "enter-test"
    Then the terminal "enter-test" should exist
