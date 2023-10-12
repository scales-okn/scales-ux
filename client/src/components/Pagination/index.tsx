import React from "react";

import { Box } from "@mui/material";
import Arrow from "./Arrow";

import type { PagingT } from "src/types/paging";

type PaginationT = {
  paging: PagingT;
  fetchData: (arg: Record<string, unknown>) => void;
  leftContent?: JSX.Element;
};

const Pagination = ({
  paging,
  fetchData,
  leftContent = <></>,
}: PaginationT) => {
  const handleNavigate = (direction) => {
    const newPage =
      direction === "right" ? paging.currentPage + 1 : paging.currentPage - 1;

    if (newPage > paging.totalPages || newPage < 1) return;

    fetchData({ page: newPage });
  };

  return (
    <Box
      sx={{
        width: "100%",
        background: "white",
        marginBottom: "12px",
        minHeight: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderRadius: "4px",
        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box>{leftContent}</Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Arrow
          direction="left"
          handleNavigate={handleNavigate}
          disabled={paging.currentPage === 1}
        />
        {paging.currentPage} of {paging.totalPages}
        <Arrow
          direction="right"
          handleNavigate={handleNavigate}
          disabled={paging.currentPage === paging.totalPages}
        />
      </Box>
    </Box>
  );
};

export default Pagination;
