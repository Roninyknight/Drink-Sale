export function buildCategoryTree(flatList) {
  const topLevels = flatList
    .filter((c) => c.level === 1)
    .sort((a, b) => a.sort - b.sort);
  return topLevels.map((parent) => ({
    groupId: parent.categoryId,
    name: parent.name,
    thumbnail: parent.thumbnail,
    children: [
      {
        groupId: parent.categoryId,
        name: parent.name,
        thumbnail: parent.thumbnail,
        children: flatList
          .filter((c) => c.parentId === parent.categoryId)
          .sort((a, b) => a.sort - b.sort)
          .map((child) => ({
            groupId: child.categoryId,
            name: child.name,
            thumbnail: child.thumbnail,
          })),
      },
    ],
  }));
}
