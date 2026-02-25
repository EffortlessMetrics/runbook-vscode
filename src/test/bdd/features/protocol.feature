Feature: Protocol Fidelity
  As a Runbook system integrator
  I need the protocol to be stable, versioned, and snake_case
  So that the Rust daemon and TypeScript extension stay in sync

  Scenario: ClientHello has correct fields
    Then a hello message should have protocol version 1
    And a hello message should have type "hello"
    And a hello message should have role "vscode"

  Scenario: VscodeCommand round-trips for send_text
    Then a vscode_command with cmd "send_text" and text "echo hi" should round-trip correctly

  Scenario: VscodeCommand round-trips for send_sequence
    Then a vscode_command with cmd "send_sequence" and sequence "Ctrl+C" should round-trip correctly

  Scenario: VS Code telemetry preserves snake_case
    Then a vscode_telemetry with workspace "/home/user" and branch "main" should round-trip in snake_case

  Scenario: Unknown message types do not crash
    Then parsing a message with type "future_event" should not throw

  Scenario: Malformed JSON does not crash
    Then parsing invalid JSON "not json at all" should not throw
    And parsing invalid JSON "{incomplete" should not throw
    And parsing invalid JSON "" should not throw
