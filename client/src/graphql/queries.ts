import { gql } from "@apollo/client";

export const SEARCH_CASES = gql`
  query SearchCases(
    $caseStatus: String
    $filingDateStart: String
    $filingDateEnd: String
    $natureSuit: String
    $first: Int
    $offset: Int
    $sortBy: String
    $sortDirection: String
  ) {
    searchCases(
      caseStatus: $caseStatus
      filingDateStart: $filingDateStart
      filingDateEnd: $filingDateEnd
      natureSuit: $natureSuit
      first: $first
      offset: $offset
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      nodes {
        caseId
        caseStatus
        filingDate
        terminatingDate
        natureSuit
        cause
      }
      totalCount
      offset
      first
      hasMore
    }
  }
`;

export const SEARCH_CHARGES = gql`
  query SearchCharges(
    $chargeDescription: String
    $chargeSeverity: String
    $chargeStatus: String
    $filingDateStart: String
    $filingDateEnd: String
    $disposition: String
    $first: Int
    $offset: Int
    $sortBy: String
    $sortDirection: String
  ) {
    searchCharges(
      chargeDescription: $chargeDescription
      chargeSeverity: $chargeSeverity
      chargeStatus: $chargeStatus
      filingDateStart: $filingDateStart
      filingDateEnd: $filingDateEnd
      disposition: $disposition
      first: $first
      offset: $offset
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      nodes {
        chargeId
        caseId
        chargeDescription
        chargeSeverity
        chargeStatus
        filingDate
        dispositionDate
        disposition
      }
      totalCount
      offset
      first
      hasMore
    }
  }
`;

export const GET_AUTOCOMPLETE_DATA = gql`
  query GetAutocompleteData($field: String!, $value: String!) {
    getAutoCompleteData(field: $field, value: $value)
  }
`;

export const GET_ENTITY_FILTERS = gql`
  query GetEntityFilters {
    getEntityFilters {
      label
      type
      field
      values
    }
  }
`;
