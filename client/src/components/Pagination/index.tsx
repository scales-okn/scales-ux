import React from "react";

import { Box, Typography } from "@mui/material";
import Arrow from "./Arrow";

import type { PagingT } from "src/types/paging";

type PaginationT = {
  paging: PagingT;
  fetchData: (arg: Record<string, unknown>) => void;
  leftContent?: JSX.Element;
  zeroIndex?: boolean;
};

const Pagination = ({
  paging,
  fetchData,
  leftContent = <></>,
  zeroIndex = false,
}: PaginationT) => {
  const renderDigit = (num) => {
    if (typeof num !== "number") {
      return num;
    }
    const out = zeroIndex ? num + 1 : num;
    return out.toLocaleString();
  };

  const disabledLeft = zeroIndex
    ? paging.currentPage === 0
    : paging.currentPage === 1;

  const disabledRight = zeroIndex
    ? paging.currentPage === paging.totalPages - 1
    : paging.currentPage === paging.totalPages;

  const handleNavigate = (direction) => {
    const newPage =
      direction === "right" ? paging.currentPage + 1 : paging.currentPage - 1;

    if (
      (disabledLeft && direction === "left") ||
      (disabledRight && direction === "right")
    ) {
      return;
    }

    fetchData({ page: newPage });
  };

  const current = renderDigit(paging.currentPage);
  const total = renderDigit(paging.totalPages);

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
          disabled={disabledLeft}
        />
        <Typography>
          Page {current} of {total}
        </Typography>
        <Arrow
          direction="right"
          handleNavigate={handleNavigate}
          disabled={disabledRight}
        />
      </Box>
    </Box>
  );
};

export default Pagination;
