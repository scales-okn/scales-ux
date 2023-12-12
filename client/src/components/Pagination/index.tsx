import React from "react";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import useWindowSize from "src/hooks/useWindowSize";

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
  const { width } = useWindowSize();
  const isTablet = width < 768;

  const renderDigit = (num) => {
    if (typeof num !== "number") {
      return num;
    }
    const out = zeroIndex ? num + 1 : num;
    return out.toLocaleString();
  };

  const firstPage = zeroIndex ? 0 : 1;
  const lastPage = zeroIndex ? paging.totalPages - 1 : paging.totalPages;

  const startBase = paging.currentPage * paging.pageSize;
  const startItem = zeroIndex ? startBase + 1 : startBase - 1;

  const adjustedCurrent = zeroIndex
    ? paging.currentPage + 1
    : paging.currentPage;
  const endItem = Math.min(
    adjustedCurrent * paging.pageSize,
    paging.totalCount,
  );

  const handleNavClick = (newPage) => {
    fetchData({ page: newPage });
  };

  const pagesToRender = () => {
    const pages = [];
    const start = Math.max(paging.currentPage - 2, 1);
    const adjustedStart = zeroIndex ? start - 1 : start;
    const end = Math.min(paging.currentPage + 2, lastPage);

    for (let i = adjustedStart; i <= end; i++) {
      if (i > paging.currentPage - 3) {
        pages.push(i);
      }
    }

    if (pages[0] !== firstPage) {
      pages.unshift(firstPage, "...");
    }

    if (pages[pages.length - 1] !== lastPage) {
      pages.push("...", lastPage);
    }

    return pages;
  };

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
        {paging.totalPages > 1 && (
          <>
            {!isTablet && (
              <Typography
                sx={{ marginRight: "12px", color: "rgb(157, 157, 157)" }}
              >
                Showing {startItem.toLocaleString()} -{" "}
                {endItem.toLocaleString()} of{" "}
                {paging.totalCount.toLocaleString()}
              </Typography>
            )}
            <Box
              sx={{ display: "flex", marginRight: "-2px", marginLeft: "2px" }}
            >
              {pagesToRender().map((page, i) => {
                if (page === "...") {
                  return (
                    <Typography
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "32px",
                        padding: "0 0px",
                        color: theme.palette.primary.main,
                        fontSize: "14px",
                        fontWeight: "500",
                        marginRight: "4px",
                        minWidth: "18px",
                      }}
                    >
                      {page}
                    </Typography>
                  );
                }
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background:
                        page === paging.currentPage
                          ? theme.palette.primary.main
                          : "none",
                      border:
                        page === paging.currentPage
                          ? "none"
                          : `1px solid ${theme.palette.primary.main}`,
                      color:
                        page === paging.currentPage
                          ? "white"
                          : theme.palette.primary.main,
                      borderRadius: "8px",
                      height: "32px",
                      padding: "0 6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginRight: "6px",
                      cursor:
                        page === paging.currentPage ? "not-allowed" : "pointer",
                      minWidth: "32px",

                      "&:hover": {
                        background:
                          page === paging.currentPage
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                        color: "white",
                      },
                    }}
                    onClick={() => handleNavClick(page)}
                  >
                    {renderDigit(page)}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Pagination;
