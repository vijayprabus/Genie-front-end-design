interface TextBlockProps {
  content: string;
}

export function TextBlock({ content }: TextBlockProps) {
  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
}
