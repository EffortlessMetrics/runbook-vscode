Feature: Extension Configuration
  As a Runbook user
  I want the extension to be properly configured out of the box
  So that I can start using it without manual setup

  Scenario: Extension commands are registered
    Then the extension command "runbook.connect" should be registered
    And the extension command "runbook.disconnect" should be registered
    And the extension command "runbook.dispatchTest" should be registered

  Scenario: Default daemon URL is configured
    Then the configuration "runbook.daemonUrl" should equal "ws://127.0.0.1:29381/ws"
