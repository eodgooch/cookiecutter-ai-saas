import ReactMarkdown from 'react-markdown';

interface RichTextProps {
  content: string;
}

/**
 * Renders blog post markdown via react-markdown.
 *
 * Raw HTML in the source is NOT interpreted (no rehype-raw): it is rendered
 * as inert text. Link/image URLs go through react-markdown's default
 * urlTransform, which drops unsafe protocols such as `javascript:`.
 */
export function RichText({ content }: RichTextProps) {
  return (
    <div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
