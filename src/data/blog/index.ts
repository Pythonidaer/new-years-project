import type { BlogPosts, BlogPost } from "./types";
import defaultPosts from "./default.json";
import interviewReusableVsFeatureSpecificComponentsPosts from "./interview_reusable_vs_feature_specific_components.json";
import interviewStructuringAComplexReactAppPosts from "./interview_structuring_a_complex_react_app_for_long_term_maintainability.json";
import interviewManagingComponentBoundariesPosts from "./interview_managing_component_boundaries_in_a_multi_team_frontend_codebase.json";
import interviewAvoidingPropDrillingPosts from "./interview_avoiding_prop_drilling_in_large_react_applications.json";
import interviewBalancingFlexibilityAndConsistencyPosts from "./interview_balancing_flexibility_and_consistency_in_a_shared_component_library.json";
import interviewRefactoringAReactCodebasePosts from "./interview_refactoring_a_react_codebase_for_scalability_and_developer_experience.json";
import interviewChoosingBetweenLocalStateContextAndExternalStateManagementPosts from "./interview_choosing_between_local_state_context_and_external_state_management.json";
import interviewAsyncDataFetchingCachingAndInvalidationInReactPosts from "./interview_async_data_fetching_caching_and_invalidation_in_react.json";
import interviewPreventingRaceConditionsAndStaleDataInAsyncReactWorkflowsPosts from "./interview_preventing_race_conditions_and_stale_data_in_async_react_workflows.json";
import interviewStructuringFrontendLogicForUnreliableOrDelayedApisPosts from "./interview_structuring_frontend_logic_for_unreliable_or_delayed_apis.json";
import interviewFormStateVsServerStateTradeoffsInReactApplicationDesignPosts from "./interview_form_state_vs_server_state_tradeoffs_in_react_application_design.json";
import interviewUsingTypeScriptToPreventRuntimeBugsInReactPosts from "./interview_using_typescript_to_prevent_runtime_bugs_in_react.json";
import interviewWhenStrictTypingChangesTheFeatureDesignPosts from "./interview_when_strict_typing_changes_the_feature_design.json";
import interviewModelingComplexApiResponsesSafelyInTypeScriptPosts from "./interview_modeling_complex_api_responses_safely_in_typescript.json";
import interviewWhenToUseAnyOrTypeAssertionsAndHowToControlTheRiskPosts from "./interview_when_to_use_any_or_type_assertions_and_how_to_control_the_risk.json";
import interviewBalancingTypeSafetyAndDevelopmentVelocityInTypeScriptPosts from "./interview_balancing_type_safety_and_development_velocity_in_typescript.json";
import interviewUnitTestsVsIntegrationTestsOnTheFrontendWhatGoesWherePosts from "./interview_unit_tests_vs_integration_tests_on_the_frontend_what_goes_where_.json";
import interviewWhatAGoodReactTestingLibraryTestLooksLikePosts from "./interview_what_a_good_react_testing_library_test_looks_like.json";
import interviewTestingAsyncBehaviorLoadingStatesAndErrorStatesInReactPosts from "./interview_testing_async_behavior_loading_states_and_error_states_in_react.json";
import interviewPreventingBrittleFrontendTestsWhenTheUiChangesFrequentlyPosts from "./interview_preventing_brittle_frontend_tests_when_the_ui_changes_frequently.json";
import interviewHowFrontendTestsFitIntoCicdQualityGatesPosts from "./interview_how_frontend_tests_fit_into_cicd_quality_gates.json";
import type { TopicId } from "../../content/types";
import { slugify } from "../../utils/slug";

export const blogPostsByTopic: Record<TopicId, BlogPosts> = {
  default: defaultPosts as BlogPosts,
  interview_reusable_vs_feature_specific_components: interviewReusableVsFeatureSpecificComponentsPosts as BlogPosts,
  interview_structuring_a_complex_react_app_for_long_term_maintainability: interviewStructuringAComplexReactAppPosts as BlogPosts,
  interview_managing_component_boundaries_in_a_multi_team_frontend_codebase: interviewManagingComponentBoundariesPosts as BlogPosts,
  interview_avoiding_prop_drilling_in_large_react_applications: interviewAvoidingPropDrillingPosts as BlogPosts,
  interview_balancing_flexibility_and_consistency_in_a_shared_component_library: interviewBalancingFlexibilityAndConsistencyPosts as BlogPosts,
  interview_refactoring_a_react_codebase_for_scalability_and_developer_experience: interviewRefactoringAReactCodebasePosts as BlogPosts,
  interview_choosing_between_local_state_context_and_external_state_management: interviewChoosingBetweenLocalStateContextAndExternalStateManagementPosts as BlogPosts,
  interview_async_data_fetching_caching_and_invalidation_in_react: interviewAsyncDataFetchingCachingAndInvalidationInReactPosts as BlogPosts,
  interview_preventing_race_conditions_and_stale_data_in_async_react_workflows: interviewPreventingRaceConditionsAndStaleDataInAsyncReactWorkflowsPosts as BlogPosts,
  interview_structuring_frontend_logic_for_unreliable_or_delayed_apis: interviewStructuringFrontendLogicForUnreliableOrDelayedApisPosts as BlogPosts,
  interview_form_state_vs_server_state_tradeoffs_in_react_application_design: interviewFormStateVsServerStateTradeoffsInReactApplicationDesignPosts as BlogPosts,
  interview_using_typescript_to_prevent_runtime_bugs_in_react: interviewUsingTypeScriptToPreventRuntimeBugsInReactPosts as BlogPosts,
  interview_when_strict_typing_changes_the_feature_design: interviewWhenStrictTypingChangesTheFeatureDesignPosts as BlogPosts,
  interview_modeling_complex_api_responses_safely_in_typescript: interviewModelingComplexApiResponsesSafelyInTypeScriptPosts as BlogPosts,
  interview_when_to_use_any_or_type_assertions_and_how_to_control_the_risk: interviewWhenToUseAnyOrTypeAssertionsAndHowToControlTheRiskPosts as BlogPosts,
  interview_balancing_type_safety_and_development_velocity_in_typescript: interviewBalancingTypeSafetyAndDevelopmentVelocityInTypeScriptPosts as BlogPosts,
  interview_unit_tests_vs_integration_tests_on_the_frontend_what_goes_where_: interviewUnitTestsVsIntegrationTestsOnTheFrontendWhatGoesWherePosts as BlogPosts,
  interview_what_a_good_react_testing_library_test_looks_like: interviewWhatAGoodReactTestingLibraryTestLooksLikePosts as BlogPosts,
  interview_testing_async_behavior_loading_states_and_error_states_in_react: interviewTestingAsyncBehaviorLoadingStatesAndErrorStatesInReactPosts as BlogPosts,
  interview_preventing_brittle_frontend_tests_when_the_ui_changes_frequently: interviewPreventingBrittleFrontendTestsWhenTheUiChangesFrequentlyPosts as BlogPosts,
  interview_how_frontend_tests_fit_into_cicd_quality_gates: interviewHowFrontendTestsFitIntoCicdQualityGatesPosts as BlogPosts,
};

export function getBlogPostsForTopic(topicId: TopicId): BlogPosts {
  return blogPostsByTopic[topicId] || blogPostsByTopic.default;
}

/**
 * Get all blog posts from all topics combined
 */
export function getAllBlogPosts(): BlogPosts {
  const allPosts: BlogPosts = [];
  Object.values(blogPostsByTopic).forEach((posts) => {
    allPosts.push(...posts);
  });
  return allPosts;
}

/**
 * Get a blog post by slug (searches across all topics)
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const allPosts = getAllBlogPosts();
  
  // Try to find by slug field first, then by generating slug from title
  const post = allPosts.find((p) => {
    if (p.slug) {
      return p.slug === slug;
    }
    return slugify(p.title) === slug;
  });

  return post || null;
}

/**
 * Get the topic ID for a given blog post
 */
export function getBlogPostTopicId(post: BlogPost): TopicId | null {
  for (const [topicId, posts] of Object.entries(blogPostsByTopic)) {
    if (posts.some((p) => p.id === post.id && p.title === post.title)) {
      return topicId;
    }
  }
  return null;
}

/**
 * Get the slug for a blog post (uses existing slug or generates from title)
 */
export function getBlogPostSlug(post: BlogPost): string {
  return post.slug || slugify(post.title);
}

/**
 * Get related blog posts (next 3 posts from all topics, excluding current post)
 */
export function getRelatedPosts(currentPostId: number, limit: number = 3): BlogPosts {
  const allPosts = getAllBlogPosts();
  
  // Find current post index
  const currentIndex = allPosts.findIndex((p) => p.id === currentPostId);
  
  if (currentIndex === -1) {
    // If post not found, return first N posts
    return allPosts.slice(0, limit);
  }
  
  // Get next posts after current one, wrapping around if needed
  const nextPosts = [];
  for (let i = 1; i <= limit && i < allPosts.length; i++) {
    const index = (currentIndex + i) % allPosts.length;
    nextPosts.push(allPosts[index]);
  }
  
  return nextPosts;
}

/**
 * Get all unique tags from all blog posts (across all topics)
 * Includes both categories and tags arrays
 */
export function getAllUniqueTags(): string[] {
  const allPosts = getAllBlogPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach(post => {
    // Add category as a tag
    if (post.category) {
      tagSet.add(post.category);
    }
    // Add all tags from tags array
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}

