import { useContent } from "../../../content/ContentProvider";
import { topics } from "../../../content/topics";
import styles from "./TopicSwitcher.module.css";

/**
 * TopicSwitcher
 * 
 * Dev-only UI component for switching content topics.
 * Fixed position, typically placed bottom-left or top-right.
 */
export function TopicSwitcher() {
  const { topicId, setTopicId } = useContent();

  return (
    <div className={styles.wrapper}>
      <label htmlFor="topic-switcher" className={styles.label}>
        Topic:
      </label>
      <select
        id="topic-switcher"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
        className={styles.select}
      >
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.label}
          </option>
        ))}
      </select>
    </div>
  );
}

