import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Tag } from "./pages/Tag";
import { ScrollToTop } from "./components/ScrollToTop";
import "./design/globals.css";
import { ThemePicker } from "./components/ThemePicker/ThemePicker";

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources/blog" element={<Blog />} />
        <Route path="/resources/blog/:slug" element={<BlogPost />} />
        <Route path="/resources/tag/:categoryName" element={<Tag />} />
      </Routes>
      <ThemePicker />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
