Feature: Render Message Handling
  As a Runbook VS Code extension
  I need to mirror the daemon's render state faithfully
  So that the pending_prompt buffer reflects the daemon's truth

  Scenario: Render with pending_prompt sets the buffer
    Given the pending prompt is empty
    When the daemon sends a render with prompt_id "prep-pr" label "Prep PR" text "/runbook:prep-pr"
    Then the pending prompt should have id "prep-pr"
    And the pending prompt should have text "/runbook:prep-pr"

  Scenario: Render with null pending_prompt clears the buffer
    Given the pending prompt has id "old-prompt" label "Old" text "old-text"
    When the daemon sends a render with no pending prompt
    Then the pending prompt should be empty

  Scenario: Render with new prompt replaces the old one
    Given the pending prompt has id "first" label "First" text "first-cmd"
    When the daemon sends a render with prompt_id "second" label "Second" text "second-cmd"
    Then the pending prompt should have id "second"
    And the pending prompt should have text "second-cmd"

  Scenario Outline: Prompt text round-trips through render
    Given the pending prompt is empty
    When the daemon sends a render with prompt_id "<id>" label "<label>" text "<text>"
    Then the pending prompt should have text "<text>"

    Examples:
      | id       | label           | text                    |
      | prep-pr  | Prep PR         | /runbook:prep-pr        |
      | deploy   | Deploy Staging  | /runbook:deploy staging |
      | fallback | Fallback Echo   | echo hello world        |
      | empty    | Empty Command   |                         |
