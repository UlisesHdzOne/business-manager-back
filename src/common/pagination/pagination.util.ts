export function getPagination(page: number, limit: number) {
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
  };
}

export function getPaginationMeta(total: number, page: number, limit: number) {
  const lastPage = Math.max(1, Math.ceil(total / limit));

  return {
    total,
    page,
    limit,
    lastPage,
  };
}
