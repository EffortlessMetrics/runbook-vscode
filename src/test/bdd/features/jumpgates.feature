Feature: Jump Gates
  As a Runbook operator
  I need to open URIs and reveal receipt files from daemon commands
  So that I can quickly navigate to PRs, issues, and evidence

  Scenario: HTTPS URI parses correctly
    Then the URI "https://github.com/org/repo/pull/42" should have scheme "https"
    And the URI "https://github.com/org/repo/pull/42" should have authority "github.com"

  Scenario: File URI parses correctly
    Then the URI "file:///tmp/receipts/2024-01-15.md" should have scheme "file"

  Scenario: Malformed URI does not crash
    Then parsing the URI "" should not throw

  Scenario: Receipt paths resolve to valid file URIs
    Then the file path "/tmp/receipts/latest.md" should produce a valid file URI
    And the file path "C:\\Users\\dev\\receipts\\run.md" should produce a valid file URI
