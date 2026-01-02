import { Home } from "./pages/Home";
import "./design/globals.css";
import { TopicSwitcher } from "./components/dev/TopicSwitcher/TopicSwitcher";

export default function App() {
  return (
    <>
      <Home />
      <TopicSwitcher />
    </>
  );
}
