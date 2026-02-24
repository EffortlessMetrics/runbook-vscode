Feature: Connection Lifecycle
  As a Runbook VS Code extension
  I need to manage my daemon connection with proper status and recovery
  So that the operator always knows the instrument state

  Scenario: Extension activates and registers all commands
    Then the extension should be active
    And the extension command "runbook.connect" should be registered
    And the extension command "runbook.disconnect" should be registered
    And the extension command "runbook.dispatchTest" should be registered

  Scenario: Default configuration values exist out of the box
    Then the configuration "runbook.daemonUrl" should equal "ws://127.0.0.1:29381/ws"
    And the configuration "runbook.escWhenPending" should equal "cancel_only"

  Scenario: Status bar item is present after activation
    Then the extension should be active
    And the status bar should exist

  Scenario: Extension operates without daemon connection
    Given I have no terminals open
    When I create a terminal named "offline-test"
    And I send the text "echo offline" to terminal "offline-test"
    Then the terminal "offline-test" should exist
    # Terminal operations work locally regardless of daemon connection state
