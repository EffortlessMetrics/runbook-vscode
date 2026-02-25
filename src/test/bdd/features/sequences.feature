Feature: Sequence Dispatch
  As a Runbook extension dispatching control sequences
  I need each named sequence to map to the correct byte
  So that the terminal receives the right raw codepoint

  Scenario Outline: Named sequence maps to correct raw byte
    Given the sequence name is "<name>"
    Then the raw byte should be "<byte>"

    Examples:
      | name    | byte   |
      | Enter   | \r     |
      | Esc     | \u001b |
      | Ctrl+C  | \u0003 |

  Scenario Outline: Unknown sequence passes through literally
    Given the sequence name is "<name>"
    Then the raw byte should be "<name>"

    Examples:
      | name    |
      | Alt+F4  |
      | Ctrl+Z  |
      | F12     |
