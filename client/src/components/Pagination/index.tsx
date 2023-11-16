import React from "react";

import { Box, Typography } from "@mui/material";
import Arrow from "./Arrow";

import useWindowSize from "src/hooks/useWindowSize";

import type { PagingT } from "src/types/paging";

type PaginationT = {
  paging: PagingT;
  fetchData: (arg: Record<string, unknown>) => void;
  leftContent?: JSX.Element;
  zeroIndex?: boolean;
  navOverride?: (location: string) => void;
};

const Pagination = ({
  paging,
  fetchData,
  leftContent = <></>,
  zeroIndex = false,
  navOverride,
}: PaginationT) => {
  const { width } = useWindowSize();
  const isTablet = width < 768;

  const noResults = paging.totalPages === 0;

  const renderDigit = (num) => {
    if (typeof num !== "number") {
      return num;
    }
    const out = zeroIndex ? num + 1 : num;
    return out.toLocaleString();
  };

  const firstPage = zeroIndex ? 0 : 1;
  const lastPage = zeroIndex ? paging.totalPages - 1 : paging.totalPages;

  const disabledLeft = paging.currentPage === firstPage || noResults;
  const disabledRight = paging.currentPage === lastPage || noResults;

  const handleNavClick = (direction, pageOverride = null) => {
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

    if (navOverride) {
      navOverride(page);
    }
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
        flexDirection: isTablet ? "column" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderRadius: "4px",
        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box>{leftContent}</Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: isTablet ? "12px" : "0",
        }}
      >
        <Arrow
          direction="left"
          handleNavigate={handleNavClick}
          disabled={disabledLeft}
          pageOverride={firstPage}
        />
        <Arrow
          direction="left"
          handleNavigate={handleNavClick}
          disabled={disabledLeft}
        />
        <Typography color="#021949d2" sx={{ marginLeft: "4px" }}>
          Page
        </Typography>
        <Typography
          sx={{
            display: "inline",
            fontSize: "16px",
            fontWeight: 600,
            padding: "0 4px",
          }}
        >
          {noResults ? 0 : current}
        </Typography>
        of
        <Typography
          sx={{
            display: "inline",
            fontSize: "16px",
            fontWeight: 600,
            padding: "0 4px",
          }}
        >
          {total}
        </Typography>
        <Arrow
          direction="right"
          handleNavigate={handleNavClick}
          disabled={disabledRight}
        />
        <Arrow
          direction="right"
          handleNavigate={handleNavClick}
          disabled={disabledRight}
          pageOverride={lastPage}
        />
      </Box>
    </Box>
  );
};

export default Pagination;
