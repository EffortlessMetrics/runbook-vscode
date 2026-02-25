Feature: Terminal Cycling Math
  As the TerminalController
  I need deterministic modular arithmetic for cycling
  So that the dial always lands on the correct terminal

  Scenario Outline: Cycling forward wraps correctly
    Given a terminal list of size <size>
    And the current index is <start>
    When I cycle by <delta>
    Then the resulting index should be <expected>

    Examples:
      | size | start | delta | expected |
      | 3    | 0     | 1     | 1        |
      | 3    | 1     | 1     | 2        |
      | 3    | 2     | 1     | 0        |
      | 5    | 4     | 1     | 0        |
      | 5    | 0     | 3     | 3        |
      | 1    | 0     | 1     | 0        |

  Scenario Outline: Cycling backward wraps correctly
    Given a terminal list of size <size>
    And the current index is <start>
    When I cycle by <delta>
    Then the resulting index should be <expected>

    Examples:
      | size | start | delta | expected |
      | 3    | 0     | -1    | 2        |
      | 3    | 2     | -1    | 1        |
      | 5    | 0     | -2    | 3        |
      | 1    | 0     | -1    | 0        |
      | 4    | 1     | -3    | 2        |

  Scenario Outline: Cycling with large deltas normalizes
    Given a terminal list of size <size>
    And the current index is <start>
    When I cycle by <delta>
    Then the resulting index should be <expected>

    Examples:
      | size | start | delta | expected |
      | 3    | 0     | 7     | 1        |
      | 3    | 0     | -7    | 2        |
      | 2    | 0     | 100   | 0        |
      | 2    | 1     | 99    | 0        |
