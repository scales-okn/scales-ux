import React from "react";

import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();

  const renderDigit = (num) => {
    if (typeof num !== "number") {
      return num;
    }
    const out = zeroIndex ? num + 1 : num;
    return out.toLocaleString();
  };

  const firstPage = zeroIndex ? 0 : 1;
  const lastPage = zeroIndex ? paging.totalPages - 1 : paging.totalPages;

  const disabledLeft = paging.currentPage === firstPage;
  const disabledRight = paging.currentPage === lastPage;

  const handleNavigate = (direction, pageOverride = null) => {
    const newPage =
      direction === "right" ? paging.currentPage + 1 : paging.currentPage - 1;

    if (
      (disabledLeft && direction === "left") ||
      (disabledRight && direction === "right")
    ) {
      return;
    }

    const page = pageOverride === null ? newPage : pageOverride;
    fetchData({ page });
  };

  const current = renderDigit(paging.currentPage);
  const total = renderDigit(lastPage);

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
          pageOverride={firstPage}
        />
        <Arrow
          direction="left"
          handleNavigate={handleNavigate}
          disabled={disabledLeft}
        />
        <Typography color="#021949d2" sx={{ padding: "0 8px" }}>
          Page {current} of {total}
        </Typography>
        <Arrow
          direction="right"
          handleNavigate={handleNavigate}
          disabled={disabledRight}
        />
        <Arrow
          direction="right"
          handleNavigate={handleNavigate}
          disabled={disabledRight}
          pageOverride={lastPage}
        />
      </Box>
    </Box>
  );
};

export default Pagination;
