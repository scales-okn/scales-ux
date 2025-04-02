import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export default function ResultsArea({ loading, data, onPageChange }) {
  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (!data)
    return <p className="text-center mt-8 text-red-500">No data available</p>;

  const {
    nodes = [],
    totalCount = 0,
    offset = 0,
    first = 10,
    hasMore = false,
  } = data;

  return (
    <div className="flex-1 p-4">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {nodes.map((courtCase) => (
            <li key={courtCase.caseId}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    Case ID: {courtCase.caseId}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {courtCase.caseStatus}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {courtCase.natureSuit}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {courtCase.jurisdiction?.name} (
                      {courtCase.jurisdiction?.level})
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Filed:{" "}
                      {courtCase.filingDate
                        ? new Date(courtCase.filingDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(0, offset - first))}
            disabled={offset === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(offset + first)}
            disabled={!hasMore}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{offset + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(offset + first, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(Math.max(0, offset - first))}
                disabled={offset === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => onPageChange(offset + first)}
                disabled={!hasMore}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
