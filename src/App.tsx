import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Tag } from "./pages/Tag";
import { ScrollToTop } from "./components/ScrollToTop";
import "./design/globals.css";
import { TopicSwitcher } from "./components/dev/TopicSwitcher/TopicSwitcher";

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources/blog" element={<Blog />} />
        <Route path="/resources/blog/:slug" element={<BlogPost />} />
        <Route path="/resources/tag/:categoryName" element={<Tag />} />
      </Routes>
      {isHomePage && <TopicSwitcher />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
