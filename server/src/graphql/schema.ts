import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type CourtCase {
    caseDocketId: ID!
    caseGeneralCategory: String
    jurisdiction: String
    caseStatus: String
    filingDate: String
    filingDateStart: String
    filingDateEnd: String
    natureSuit: String
    cause: String
    terminatingDate: String
    ontologlyLabel: String
    charges: [Charge!]
    judge: Judge
    court: Court
  }

  type Charge {
    chargeId: ID!
    chargeDescription: String
    chargeStatus: String
    chargeType: String
    disposition: String
    filingDate: String
  }

  type Judge {
    judgeId: ID!
    name: String
  }

  type Court {
    courtId: ID!
    name: String
  }

  type CourtCasePaginatedList {
    nodes: [CourtCase!]!
    totalCount: Int!
    offset: Int!
    first: Int!
    hasMore: Boolean!
  }

  type ChargePaginatedList {
    nodes: [Charge!]!
    totalCount: Int!
    offset: Int!
    first: Int!
    hasMore: Boolean!
  }

  type PropertyInfo {
    name: String!
    type: String!
    field: String!
  }

  type AutoComplete {
    label: String!
    value: String!
  }

  type Filter {
    label: String!
    type: String!
    field: String!
    value: String!
    subFilters: [Filter!]
    autoComplete: [AutoComplete!]
  }
  
  type Query {
    case(id: ID!): CourtCase
    cases(
      first: Int = 10, 
      offset: Int = 0, 
      sortBy: String, 
      sortDirection: String = "ASC"
    ): CourtCasePaginatedList!
    
    searchCases(
      caseStatus: String, 
      filingDateStart: String, 
      filingDateEnd: String, 
      natureSuit: String, 
      first: Int = 5, 
      offset: Int = 0, 
      sortBy: String, 
      sortDirection: String = "ASC"
    ): CourtCasePaginatedList!
    
    charge(id: ID!): Charge
    charges(
      first: Int = 10, 
      offset: Int = 0, 
      sortBy: String, 
      sortDirection: String = "ASC"
    ): ChargePaginatedList!
    
    searchCharges(
      chargeDescription: String, 
      chargeStatus: String, 
      chargeType: String,
      disposition: String, 
      filingDateStart: String, 
      filingDateEnd: String, 
      first: Int = 5, 
      offset: Int = 0, 
      sortBy: String, 
      sortDirection: String = "ASC"
    ): ChargePaginatedList!
    
    getFiltersForEntity(entity: String!): [Filter!]!
    getAutoCompleteData(field: String, value: String): [String!]!
  }
`

