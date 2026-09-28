export function planningMap(markdown) {
  let scope = '';
  const nodes = [];
  const pathways = [];
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^## (Discover|Measure|Control|Integrate|Investigate)\b/.exec(line);
    if (heading) scope = heading[1];
    if (/^\*\*[A-Z]{2,3}-\d{2} — /.test(line)) {
      const node = /^\*\*([A-Z]{2,3}-\d{2}) — ([^*]+)\*\* · Prerequisites: ([^.]+)\. (.+)$/.exec(line);
      if (!node || !scope) throw new Error(`Unsupported planning entry: ${line.slice(0, 80)}`);
      const clause = node[3].split(';')[0].trim();
      const prerequisites = clause === 'none' ? [] : [...clause.matchAll(/\b[A-Z]{2,3}-\d{2}\b/g)].map(match => match[0]);
      const remainder = clause.replace(/\b[A-Z]{2,3}-\d{2}\b/g, '').replace(/\band\b|[,\s]/g, '');
      if ((clause !== 'none' && (remainder || !prerequisites.length)) || new Set(prerequisites).size !== prerequisites.length)
        throw new Error(`Unsupported prerequisite statement: ${node[1]}`);
      nodes.push({ id: node[1], title: node[2], scope, status: 'planning',
        prerequisites, prerequisiteText: node[3], brief: node[4] });
    }
    if (line.startsWith('| **P-')) {
      const cells = line.split('|').slice(1, -1).map(value => value.trim());
      if (cells.length !== 3) throw new Error('Unsupported pathway table');
      pathways.push({ label: cells[0], sequence: cells[1], boundary: cells[2], status: 'planning' });
    }
  }
  const byId = new Map(nodes.map(node => [node.id, node]));
  if (!nodes.length || byId.size !== nodes.length || !pathways.length) throw new Error('Missing or duplicate planning IDs');
  for (const node of nodes) for (const prerequisite of node.prerequisites)
    if (!byId.has(prerequisite)) throw new Error(`Unknown prerequisite ${prerequisite}`);
  const active = new Set();
  const complete = new Set();
  function visit(id) {
    if (active.has(id)) throw new Error(`Cyclic prerequisite ${id}`);
    if (complete.has(id)) return;
    active.add(id);
    for (const dependency of byId.get(id).prerequisites) visit(dependency);
    active.delete(id);
    complete.add(id);
  }
  for (const node of nodes) visit(node.id);
  return { nodes, pathways };
}
