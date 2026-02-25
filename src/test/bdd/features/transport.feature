Feature: Transport Reconnection
  As a Runbook extension
  I need the WebSocket client to handle disconnection gracefully
  So that the instrument recovers without operator intervention

  Scenario: Client state starts as disconnected
    Given a fresh daemon client
    Then the client state should be "disconnected"

  Scenario: Connecting to an unreachable daemon does not crash
    Given a fresh daemon client
    When the client attempts to connect to "ws://127.0.0.1:19999/ws"
    Then the client state should be "disconnected"

  Scenario: Sending a message while disconnected buffers or drops silently
    Given a fresh daemon client
    When the client sends a hello message
    Then the client should not throw

  Scenario Outline: Reconnect backoff increases per attempt (1.5x growth, 30s cap)
    Given a reconnect attempt number <attempt>
    Then the backoff delay should be at least <min_ms> ms
    And the backoff delay should be at most <max_ms> ms

    Examples:
      | attempt | min_ms | max_ms |
      | 0       | 1000   | 1000   |
      | 1       | 1500   | 1500   |
      | 2       | 2250   | 2250   |
      | 3       | 3375   | 3375   |
      | 4       | 5062   | 5063   |
      | 10      | 30000  | 30000  |
