export const diff = (curr, next) => {
  curr[0].Price = '$1';

  const currIds = new Set(curr.map(item => item.Id));
  const nextIds = new Set(next.map(item => item.Id));

  let added = new Set([...nextIds].filter(id => !currIds.has(id)));
  let removed = new Set([...currIds].filter(id => !nextIds.has(id)));
  let persisted = new Set([...currIds].filter(id => nextIds.has(id)));

  let changed = {};
  persisted.forEach((id) => {
    const changes = compare(getItemById(id, curr), getItemById(id, next));
    if (Object.keys(changes).length > 0) {
      changed[id] = changes;
    }
  })

  return {
    added,
    removed,
    changed,
  }
};

const compare = (a, b) => {
  const aProps = new Set(Object.getOwnPropertyNames(a));
  const bProps = new Set(Object.getOwnPropertyNames(b));

  let added = new Set([...bProps].filter(prop => !aProps.has(prop)));
  let removed = new Set([...aProps].filter(prop => !bProps.has(prop)));
  let persisted = new Set([...aProps].filter(prop => bProps.has(prop)));

  let changed = [];
  persisted.forEach((prop) => {
    if (a[prop] !== b[prop]) {
      changed.push(prop);
    }
  });

  let result = {};
  if (added.length > 0) {
    result.added = added;
  }
  if (removed.length > 0) {
    result.removed = removed;
  }
  if (changed.length > 0) {
    result.changed = changed;
  }

  return result;
};

// item MUST exist
const getItemById = (id, items) => (
  items.filter(item => item.Id === id)[0]
);
