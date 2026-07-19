export function formatAssistantResponse(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={`space-${index}`} className="h-3" />;
    }

    const isHeading =
      trimmedLine.startsWith("🧠") ||
      trimmedLine.startsWith("🎯") ||
      trimmedLine.startsWith("📋") ||
      trimmedLine.startsWith("⚠️") ||
      trimmedLine.startsWith("💡");

    const isListItem =
      trimmedLine.startsWith("-") ||
      trimmedLine.startsWith("•") ||
      /^\d+\./.test(trimmedLine);

    if (isHeading) {
      return (
        <h3
          key={`${trimmedLine}-${index}`}
          className="mt-5 text-sm font-semibold text-foreground/90 first:mt-0"
        >
          {trimmedLine}
        </h3>
      );
    }

    if (isListItem) {
      return (
        <p
          key={`${trimmedLine}-${index}`}
          className="ml-2 mt-2 text-sm leading-6 text-foreground/60"
        >
          {trimmedLine}
        </p>
      );
    }

    return (
      <p
        key={`${trimmedLine}-${index}`}
        className="mt-2 text-sm leading-6 text-foreground/60"
      >
        {trimmedLine}
      </p>
    );
  });
}
