import { sanitizeHtml } from './utils';

type TipTapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
};

export function renderTipTapJson(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';

  // If doc is raw HTML string or has an html property
  if (typeof (doc as Record<string, unknown>)['html'] === 'string') {
    return sanitizeHtml((doc as Record<string, unknown>)['html'] as string);
  }

  const root = doc as TipTapNode;
  if (!root.content && !root.text) return '';

  function renderMarks(text: string, marks?: TipTapMark[]): string {
    if (!marks || marks.length === 0) return text;
    let result = text;
    for (const mark of marks) {
      if (mark.type === 'bold') {
        result = `<strong>${result}</strong>`;
      } else if (mark.type === 'italic') {
        result = `<em>${result}</em>`;
      } else if (mark.type === 'underline') {
        result = `<u>${result}</u>`;
      } else if (mark.type === 'strike') {
        result = `<s>${result}</s>`;
      } else if (mark.type === 'code') {
        result = `<code>${result}</code>`;
      } else if (mark.type === 'link') {
        const href = (mark.attrs?.['href'] as string) || '#';
        result = `<a href="${href}" target="_blank" rel="noopener noreferrer">${result}</a>`;
      }
    }
    return result;
  }

  function renderNode(node: TipTapNode): string {
    if (node.type === 'text') {
      const escaped = (node.text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return renderMarks(escaped, node.marks);
    }

    const innerHtml = node.content ? node.content.map(renderNode).join('') : '';

    switch (node.type) {
      case 'doc':
        return innerHtml;
      case 'paragraph':
        return `<p>${innerHtml || '<br>'}</p>`;
      case 'heading': {
        const level = (node.attrs?.['level'] as number) || 2;
        return `<h${level}>${innerHtml}</h${level}>`;
      }
      case 'blockquote':
        return `<blockquote>${innerHtml}</blockquote>`;
      case 'bulletList':
        return `<ul>${innerHtml}</ul>`;
      case 'orderedList':
        return `<ol>${innerHtml}</ol>`;
      case 'listItem':
        return `<li>${innerHtml}</li>`;
      case 'codeBlock':
        return `<pre><code>${innerHtml}</code></pre>`;
      case 'horizontalRule':
        return `<hr/>`;
      case 'image': {
        const src = (node.attrs?.['src'] as string) || '';
        const alt = (node.attrs?.['alt'] as string) || '';
        return `<img src="${src}" alt="${alt}" loading="lazy"/>`;
      }
      default:
        return innerHtml;
    }
  }

  const rawHtml = renderNode(root);
  return sanitizeHtml(rawHtml);
}
