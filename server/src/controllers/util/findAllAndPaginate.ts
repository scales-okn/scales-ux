export const findAllAndPaginate = async ({ model, query, dataName = "data", where = {}, order = [["id", "DESC"]], attributes = {}, include = [] }) => {
  const page = parseInt(String(query.page || "1"));
  const pageSize = parseInt(String(query.pageSize || "20"));
  const offset = (page - 1) * pageSize;

  const data = await model.findAndCountAll({
    attributes,
    order,
    where,
    include,
    offset,
    limit: pageSize,
  });

  const totalCount = data.count;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    [dataName]: data.rows,
    paging: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
    },
  };
};
