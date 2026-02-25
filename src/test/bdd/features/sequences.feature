Feature: Sequence Dispatch
  As a Runbook extension dispatching control sequences
  I need each named sequence to map to the correct byte
  So that the terminal receives the right raw codepoint

  Scenario Outline: Named sequence maps to correct raw byte
    Given the sequence name is "<name>"
    Then the raw byte should be "<byte>"

    Examples:
      | name    | byte   |
      | Esc     | \u001b |
      | Ctrl+C  | \u0003 |

  Scenario: Enter sequence is specially handled as an execution request
    Given the sequence name is "Enter"
    Then the sequence should trigger standard execution dispatch

  Scenario Outline: Unknown sequence passes through literally
    Given the sequence name is "<name>"
    Then the raw byte should be "<name>"

    Examples:
      | name    |
      | Alt+F4  |
      | Ctrl+Z  |
      | F12     |
