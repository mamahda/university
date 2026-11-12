// Renders the live scene graph as a nested list. Siblings that differ only by a trailing
// number (UpperMullion0, UpperMullion1, ...) are collapsed into one row together with
// their identical subtrees.
const OPEN_DEPTH = 3;

function groupChildren(children) {
  const groups = [];
  for (const child of children) {
    const match = child.name.match(/^(.*?)(\d+)$/);
    const last = groups[groups.length - 1];
    if (match && last?.base === match[1]) {
      last.nodes.push(child);
      last.last = match[2];
    } else if (match) {
      groups.push({ base: match[1], first: match[2], last: match[2], nodes: [child] });
    } else {
      groups.push({ nodes: [child] });
    }
  }
  return groups;
}

function label(node, extra) {
  const fragment = document.createDocumentFragment();
  const name = document.createElement('span');
  name.className = 'tree-name';
  name.textContent = extra?.name ?? node.name;
  fragment.append(name);
  if (extra?.count) {
    const count = document.createElement('span');
    count.className = 'tree-count';
    count.textContent = `×${extra.count}`;
    fragment.append(count);
  }
  if (/Pivot/.test(node.name)) fragment.append(tag('pivot', true));
  else if (!node.mesh) fragment.append(tag('grup'));
  return fragment;
}

function tag(text, accent = false) {
  const element = document.createElement('span');
  element.className = accent ? 'tag tag-accent' : 'tag';
  element.textContent = text;
  return element;
}

function buildList(nodes, depth) {
  const list = document.createElement('ul');
  for (const group of groupChildren(nodes)) {
    const item = document.createElement('li');
    const node = group.nodes[0];
    if (group.nodes.length > 1) {
      item.append(label(node, { name: `${group.base}${group.first}–${group.last}`, count: group.nodes.length }));
    } else if (node.children.length > 0) {
      const details = document.createElement('details');
      details.open = depth < OPEN_DEPTH;
      const summary = document.createElement('summary');
      summary.append(label(node));
      details.append(summary, buildList(node.children, depth + 1));
      item.append(details);
    } else {
      item.append(label(node));
    }
    list.append(item);
  }
  return list;
}

export function renderSceneTree(container, root) {
  container.replaceChildren(buildList([root], 0));
}
