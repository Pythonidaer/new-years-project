import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { registerContrastNavigator, resumeContrastReview } from "@/utils/contrastJump";
import { Home } from "./pages/Home";
import { ScrollToTop } from "./components/ScrollToTop";
import { BlogSkeleton } from "./components/BlogSkeleton";
import "./design/globals.css";
import { ThemePicker } from "./components/ThemePicker/ThemePicker";
import { AudioControl } from "./components/AudioControl/AudioControl";

// Lazy load blog routes to reduce initial bundle size
// All blog JSON files will be in separate chunks, not in main bundle
// Note: These are named exports, so we need to map them to default
const Blog = lazy(() => import("./pages/Blog").then(module => ({ default: module.Blog })));
const BlogPost = lazy(() => import("./pages/BlogPost").then(module => ({ default: module.BlogPost })));
const Tag = lazy(() => import("./pages/Tag").then(module => ({ default: module.Tag })));

function ContrastReviewHost() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    registerContrastNavigator(navigate);
  }, [navigate]);

  useEffect(() => {
    resumeContrastReview();
  }, [pathname]);

  return null;
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <ContrastReviewHost />
      <Suspense fallback={<BlogSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources/blog" element={<Blog />} />
          <Route path="/resources/blog/:slug" element={<BlogPost />} />
          <Route path="/resources/tag/:categoryName" element={<Tag />} />
        </Routes>
      </Suspense>
      <ThemePicker hideColorControlsUntilContrastIssue={false} />
      <AudioControl />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
