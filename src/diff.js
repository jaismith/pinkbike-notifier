const compare = (a, b) => {
  const aProps = new Set(Object.getOwnPropertyNames(a));
  const bProps = new Set(Object.getOwnPropertyNames(b));

  const added = new Set([...bProps].filter((prop) => {
    return !aProps.has(prop);
  }));
  const removed = new Set([...aProps].filter((prop) => {
    return !bProps.has(prop);
  }));
  const persisted = new Set([...aProps].filter((prop) => {
    return bProps.has(prop);
  }));

  const changed = [];
  persisted.forEach((prop) => {
    if (a[prop] !== b[prop]) {
      changed.push(prop);
    }
  });

  const result = {};
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
export const getItemById = (id, items) => {
  return (
    items.filter((item) => {
      return item.Id === id;
    })[0]
  );
};

export const diff = (curr, next) => {
  curr.pop();
  curr[0].Price = '$1';

  const currIds = new Set(curr.map((item) => { return item.Id; }));
  const nextIds = new Set(next.map((item) => { return item.Id; }));

  const added = new Set([...nextIds].filter((id) => {
    return !currIds.has(id);
  }));
  const removed = new Set([...currIds].filter((id) => {
    return !nextIds.has(id);
  }));
  const persisted = new Set([...currIds].filter((id) => {
    return nextIds.has(id);
  }));

  const changed = {};
  persisted.forEach((id) => {
    const changes = compare(getItemById(id, curr), getItemById(id, next));
    if (Object.keys(changes).length > 0) {
      changed[id] = changes;
    }
  });

  return {
    added,
    removed,
    changed,
  };
};
