interface RichTextProps {
  content: string;
}

/**
 * Simple markdown-like renderer for blog post content.
 * Renders plain markdown text as HTML using dangerouslySetInnerHTML.
 *
 * For production, consider using a proper markdown library like
 * react-markdown or next-mdx-remote.
 */
export function RichText({ content }: RichTextProps) {
  // Simple markdown to HTML conversion
  const html = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<p>${html}</p>`,
      }}
    />
  );
}
