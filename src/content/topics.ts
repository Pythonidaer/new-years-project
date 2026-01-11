import type { TopicMetadata, TopicId } from "./types";

/**
 * Topic Registry
 * 
 * Defines all available content topics. Add new topics here.
 * Each topic must have a corresponding entry in contentMap.ts
 */
export const topics: TopicMetadata[] = [
  {
    id: "default",
    label: "Default (Lorem Ipsum)",
    description: "Default placeholder content",
  },
  {
    id: "interview_reusable_vs_feature_specific_components",
    label: "Reusable vs Feature-Specific Components",
    description: "A practical way to decide between reusable UI components and feature-specific components by optimizing for change, stable responsibilities, and maintainable APIs",
  },
  {
    id: "interview_structuring_a_complex_react_app_for_long_term_maintainability",
    label: "Structuring a Complex React App for Long-Term Maintainability",
    description: "How senior engineers structure large React applications using clear boundaries, feature ownership, and dependency discipline to keep change safe over time",
  },
  {
    id: "interview_managing_component_boundaries_in_a_multi_team_frontend_codebase",
    label: "Managing Component Boundaries in a Multi-Team Frontend Codebase",
    description: "How teams keep a shared frontend maintainable by defining ownership, enforcing import boundaries, and exposing small public APIs instead of sharing internal implementation details",
  },
  {
    id: "interview_avoiding_prop_drilling_in_large_react_applications",
    label: "Avoiding Prop Drilling in Large React Applications",
    description: "Practical patterns to reduce pass-through props in large React apps: colocate state, use scoped context, compound components, and hooks as boundaries—without turning everything into global state",
  },
  {
    id: "interview_balancing_flexibility_and_consistency_in_a_shared_component_library",
    label: "Balancing Flexibility and Consistency in a Shared Component Library",
    description: "How shared component libraries stay usable long-term: constrain APIs for consistent outcomes, enable flexibility through variants and composition, and avoid escape-hatch props that bypass design guarantees",
  },
  {
    id: "interview_refactoring_a_react_codebase_for_scalability_and_developer_experience",
    label: "Refactoring a React Codebase for Scalability and Developer Experience",
    description: "A practical refactor story: breaking up \"god components,\" introducing feature boundaries, separating data loading from UI, and improving testing so the React codebase scales with the team",
  },
  {
    id: "interview_choosing_between_local_state_context_and_external_state_management",
    label: "Choosing Between Local State, Context, and External State Management",
    description: "A practical decision framework for choosing local state, React context, or an external state library based on scope, lifetime, complexity, and whether the data is actually server state",
  },
  {
    id: "interview_async_data_fetching_caching_and_invalidation_in_react",
    label: "Async Data Fetching, Caching, and Invalidation in React",
    description: "A practical way to handle server state in React: standardize fetching through a query cache, tune freshness and retention, and keep UI correct with targeted invalidation and occasional optimistic updates",
  },
  {
    id: "interview_preventing_race_conditions_and_stale_data_in_async_react_workflows",
    label: "Preventing Race Conditions and Stale Data in Async React Workflows",
    description: "How React teams avoid stale data and race conditions: cancel outdated requests, ignore stale responses, key server-state caches correctly, and handle optimistic updates with rollback and invalidation",
  },
  {
    id: "interview_structuring_frontend_logic_for_unreliable_or_delayed_apis",
    label: "Structuring Frontend Logic for Unreliable or Delayed APIs",
    description: "How resilient React frontends handle slow or unreliable APIs: standardize remote-data state, use stale-while-revalidate, make retries deliberate, and design writes to be safe under delay",
  },
  {
    id: "interview_form_state_vs_server_state_tradeoffs_in_react_application_design",
    label: "Form State vs Server State: Tradeoffs in React Application Design",
    description: "How senior engineers think about state boundaries: forms as user-owned draft state vs server-driven data as cached shared truth, with intentional synchronization and invalidation",
  },
  {
    id: "interview_using_typescript_to_prevent_runtime_bugs_in_react",
    label: "Using TypeScript to Prevent Runtime Bugs in React",
    description: "How TypeScript reduces production bugs in React by modeling impossible states, typing async boundaries, enforcing exhaustiveness, and validating untrusted data at runtime",
  },
  {
    id: "interview_when_strict_typing_changes_the_feature_design",
    label: "When Strict Typing Changes the Feature Design",
    description: "A concrete example of strict typing reshaping feature design: modeling a multi-step flow as explicit states and transitions to make invalid UI states impossible",
  },
  {
    id: "interview_modeling_complex_api_responses_safely_in_typescript",
    label: "Modeling Complex API Responses Safely in TypeScript",
    description: "A safe, scalable way to model complex API responses: validate at runtime, infer types from schemas, use discriminated unions for polymorphic data, and standardize success/error results",
  },
  {
    id: "interview_when_to_use_any_or_type_assertions_and_how_to_control_the_risk",
    label: "When to Use any or Type Assertions and How to Control the Risk",
    description: "A practical policy for using TypeScript escape hatches: when any or assertions are acceptable, and how to contain the blast radius with boundaries, validation, wrappers, and linting",
  },
  {
    id: "interview_balancing_type_safety_and_development_velocity_in_typescript",
    label: "Balancing Type Safety and Development Velocity in TypeScript",
    description: "How senior engineers keep TypeScript helpful without slowing teams down: strictness at boundaries, pragmatic modeling in features, contained escape hatches, and guardrails that prevent unsafety from spreading",
  },
  {
    id: "interview_unit_tests_vs_integration_tests_on_the_frontend_what_goes_where_",
    label: "Unit Tests vs Integration Tests on the Frontend: What Goes Where",
    description: "A practical decision framework for frontend testing: use unit tests for pure logic and boundary mapping, and integration tests for user-visible behavior across components, hooks, and async data",
  },
  {
    id: "interview_what_a_good_react_testing_library_test_looks_like",
    label: "What a Good React Testing Library Test Looks Like",
    description: "What makes a React Testing Library test maintainable: user-visible assertions, accessible queries, boundary mocking, deterministic async handling, and resilience to refactors",
  },
  {
    id: "interview_testing_async_behavior_loading_states_and_error_states_in_react",
    label: "Testing Async Behavior, Loading States, and Error States in React",
    description: "How to reliably test async UI in React: deterministic boundary mocking, state-based assertions for loading/success/error, and controlled retry sequences to prove recovery",
  },
  {
    id: "interview_preventing_brittle_frontend_tests_when_the_ui_changes_frequently",
    label: "Preventing Brittle Frontend Tests When the UI Changes Frequently",
    description: "How to keep frontend tests stable during frequent UI churn: avoid DOM structure and CSS selectors, assert on user-facing contracts, keep assertions minimal, and extract repeated interactions into helpers",
  },
  {
    id: "interview_how_frontend_tests_fit_into_cicd_quality_gates",
    label: "How Frontend Tests Fit Into CI/CD Quality Gates",
    description: "How frontend test suites become CI/CD quality gates: layered checks that fail fast, stable unit/integration gates for PRs, small E2E smoke gates for deploys, and targeted gates for visual/a11y/perf risk",
  },
];

/**
 * Default topic ID to use when no topic is selected or an invalid topic is requested.
 */
export const DEFAULT_TOPIC_ID: TopicId = "default";

/**
 * Get topic metadata by ID
 */
export function getTopicById(id: string): TopicMetadata | undefined {
  return topics.find((t) => t.id === id);
}

/**
 * Check if a topic ID is valid
 */
export function isValidTopicId(id: string): boolean {
  return topics.some((t) => t.id === id);
}

