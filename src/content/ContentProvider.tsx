import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ContentKey } from "./types";
import { getContent } from "./contentMap";
import { DEFAULT_TOPIC_ID, isValidTopicId } from "./topics";

interface ContentContextValue {
  topicId: string;
  setTopicId: (id: string) => void;
  t: (key: ContentKey) => string;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
  initialTopicId?: string;
}

/**
 * ContentProvider
 * 
 * Provides content translation function and topic switching to the app.
 * Wrap your app with this provider to enable content switching.
 */
export function ContentProvider({
  children,
  initialTopicId = DEFAULT_TOPIC_ID,
}: ContentProviderProps) {
  const [topicId, setTopicIdState] = useState<string>(() => {
    // Validate initial topic ID
    if (isValidTopicId(initialTopicId)) {
      return initialTopicId;
    }
    return DEFAULT_TOPIC_ID;
  });

  const setTopicId = useCallback((id: string) => {
    if (isValidTopicId(id)) {
      setTopicIdState(id);
    } else {
      console.warn(`Invalid topic ID: ${id}. Falling back to default.`);
      setTopicIdState(DEFAULT_TOPIC_ID);
    }
  }, []);

  const t = useCallback(
    (key: ContentKey): string => {
      return getContent(topicId, key);
    },
    [topicId]
  );

  return (
    <ContentContext.Provider value={{ topicId, setTopicId, t }}>
      {children}
    </ContentContext.Provider>
  );
}

/**
 * useContent hook
 * 
 * Access the content context. Use this hook in components to get:
 * - t(key): translation function for content keys
 * - topicId: current active topic ID
 * - setTopicId: function to change the active topic
 * 
 * @example
 * ```tsx
 * const { t } = useContent();
 * <h1>{t("hero.title")}</h1>
 * ```
 */
export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}

