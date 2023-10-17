export const findAllAndPaginate = async ({
  model,
  query,
  dataName = "data",
  where = {},
  order = [["id", "DESC"]],
  attributes = {},
}) => {
  const page = parseInt(String(query.page || "1"));
  const pageSize = parseInt(String(query.pageSize || "20"));
  const offset = (page - 1) * pageSize;

  const data = await model.findAndCountAll({
    attributes,
    order,
    where,
    offset,
    limit: pageSize,
  });

  const totalItems = data.count;
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    [dataName]: data.rows,
    paging: {
      totalItems,
      totalPages,
      currentPage: page,
    },
  };
};
