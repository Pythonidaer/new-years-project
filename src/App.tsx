import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
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

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<BlogSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources/blog" element={<Blog />} />
          <Route path="/resources/blog/:slug" element={<BlogPost />} />
          <Route path="/resources/tag/:categoryName" element={<Tag />} />
        </Routes>
      </Suspense>
      <ThemePicker />
      <AudioControl />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
