import { visit } from 'unist-util-visit';

export default function remarkBaseLinks({ base = '/' } = {}) {
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;

  return function transformer(tree) {
    if (!prefix) return;
    visit(tree, 'link', (node) => {
      const url = node.url;
      if (typeof url !== 'string') return;
      if (!url.startsWith('/')) return;
      if (url.startsWith('//')) return;
      if (url.startsWith(prefix + '/') || url === prefix) return;
      node.url = prefix + url;
    });
  };
}
