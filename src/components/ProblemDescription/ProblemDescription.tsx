import styles from "./ProblemDescription.module.css";

interface ProblemDescriptionProps {
  description: string;
  variant: "preview" | "detailed";
}

export default function ProblemDescription({ description, variant }: ProblemDescriptionProps) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderTextWithLinks = (text: string) => {
    const parts = text.split(urlRegex);
    return parts.map((subPart, i) => {
      if (subPart.match(urlRegex)) {
        return (
          <a
            key={i}
            href={subPart}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {subPart}
          </a>
        );
      }
      return subPart;
    });
  };

  // Split by code blocks
  const sections = description.split(/```/);
  const containerClass = `${styles.container} ${styles[variant]}`;

  return (
    <div className={containerClass}>
      {sections.map((section, sIndex) => {
        // Every odd index is a code block
        if (sIndex % 2 === 1) {
          const code = section.replace(/^[a-z]+\n/, "");
          return (
            <div key={sIndex} className={styles.codeBlock}>
              <pre style={{ margin: 0 }}>{code.trim()}</pre>
            </div>
          );
        }

        // Even indices: Process non-code text line by line to detect lists
        const lines = section.split("\n");
        const elements: React.ReactNode[] = [];
        let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

        const flushList = () => {
          if (currentList) {
            const Tag = currentList.type;
            const listKey = `list-${sIndex}-${elements.length}`;
            elements.push(
              <Tag key={listKey} className={styles[currentList.type]}>
                {currentList.items.map((item, i) => (
                  <li key={i} className={styles.listItem}>
                    {renderTextWithLinks(item)}
                  </li>
                ))}
              </Tag>
            );
            currentList = null;
          }
        };

        lines.forEach((line, lineIndex) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) {
            flushList();
            return;
          }

          // Check for unordered list (•, -, *)
          const ulMatch = trimmedLine.match(/^[•\-*]\s+(.*)/);
          if (ulMatch) {
            if (currentList && currentList.type !== "ul") flushList();
            if (!currentList) currentList = { type: "ul", items: [] };
            currentList.items.push(ulMatch[1]);
            return;
          }

          // Check for ordered list (1., 2.)
          const olMatch = trimmedLine.match(/^\d+\.\s+(.*)/);
          if (olMatch) {
            if (currentList && currentList.type !== "ol") flushList();
            if (!currentList) currentList = { type: "ol", items: [] };
            currentList.items.push(olMatch[1]);
            return;
          }

          flushList();
          elements.push(
            <div key={`${sIndex}-${lineIndex}`} className={styles.paragraph}>
              {renderTextWithLinks(trimmedLine)}
            </div>
          );
        });

        flushList();
        return elements;
      })}
    </div>
  );
}
