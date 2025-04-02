import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

// const GET_JURISDICTIONS = gql`
//   query GetJurisdictions {
//     jurisdictions {
//       id
//       name
//       level
//     }
//   }
// `;

export default function SidePanel({ searchParams, onFilterChange }) {
  const [caseStatus, setCaseStatus] = useState(searchParams.caseStatus);
  const [filingDateStart, setFilingDateStart] = useState(
    searchParams.filingDateStart,
  );
  const [filingDateEnd, setFilingDateEnd] = useState(
    searchParams.filingDateEnd,
  );
  const [natureSuit, setNatureSuit] = useState(searchParams.natureSuit);

  useEffect(() => {
    onFilterChange({
      caseStatus,
      filingDateStart,
      filingDateEnd,
      natureSuit,
    });
  }, [caseStatus, filingDateStart, filingDateEnd, natureSuit]);

  // const filteredJurisdictions =
  //   query === ""
  //     ? jurisdictionData?.jurisdictions ?? []
  //     : jurisdictionData?.jurisdictions.filter((j) =>
  //         j.name.toLowerCase().includes(query.toLowerCase()),
  //       ) ?? [];

  return (
    <div className="w-full md:w-64 bg-white shadow-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Filters</h2>

      <div>
        <label
          htmlFor="caseStatus"
          className="block text-sm font-medium text-gray-700"
        >
          Case Status
        </label>
        <input
          type="text"
          id="caseStatus"
          value={caseStatus}
          onChange={(e) => setCaseStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="filingDateStart"
          className="block text-sm font-medium text-gray-700"
        >
          Filing Date Start
        </label>
        <input
          type="date"
          id="filingDateStart"
          value={filingDateStart}
          onChange={(e) => setFilingDateStart(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="filingDateEnd"
          className="block text-sm font-medium text-gray-700"
        >
          Filing Date End
        </label>
        <input
          type="date"
          id="filingDateEnd"
          value={filingDateEnd}
          onChange={(e) => setFilingDateEnd(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="natureSuit"
          className="block text-sm font-medium text-gray-700"
        >
          Nature of Suit
        </label>
        <input
          type="text"
          id="natureSuit"
          value={natureSuit}
          onChange={(e) => setNatureSuit(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
    </div>
  );
}
