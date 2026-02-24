Feature: Pending Prompt Contract
  As a Runbook operator
  I need selection (keypad) to be separated from commit (dialpad Enter)
  So that I never accidentally dispatch a prompt to the agent

  Background:
    Given I have no terminals open
    When I create a terminal named "agent"

  Scenario: Enter with no pending prompt sends bare Enter
    Then the terminal "agent" should exist
    # With no pending_prompt, Enter = passthrough newline

  Scenario: Enter with pending prompt sends prompt text then clears buffer
    Then the terminal "agent" should exist
    # When daemon sets pending_prompt, Enter injects text + newline
    # After dispatch, pending_prompt is consumed (null)

  Scenario: Esc with no pending prompt passes through to terminal
    Then the terminal "agent" should exist
    # With no pending_prompt, Esc = send \u001b to terminal

  Scenario: Esc with pending prompt cancels without terminal side-effect (cancel_only)
    Then the terminal "agent" should exist
    # When pending_prompt exists and escWhenPending = cancel_only:
    #   - pending_prompt is cleared
    #   - NO Esc sent to terminal
    #   - Ctrl+C remains available for hard interrupt

  Scenario: Esc with pending prompt cancels AND passes through (cancel_and_passthrough)
    Then the terminal "agent" should exist
    # When pending_prompt exists and escWhenPending = cancel_and_passthrough:
    #   - pending_prompt is cleared
    #   - Esc IS sent to terminal

  Scenario: Ctrl+C always interrupts regardless of pending state
    And I send the sequence "Ctrl+C" to terminal "agent"
    Then the terminal "agent" should exist
    # Ctrl+C never checks pending_prompt
    # It always reaches Claude (concave key = hard interrupt)
