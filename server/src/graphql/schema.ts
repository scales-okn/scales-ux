import { gql } from "@apollo/client"

export const typeDefs = gql`
  type CourtCase {
    caseId: ID!
    caseStatus: String
    filingDate: String
    terminatingDate: String
    natureSuit: String
    cause: String
  }

  type Charge {
    chargeId: ID!
    caseId: ID
    chargeDescription: String
    chargeSeverity: String
    chargeStatus: String
    filingDate: String
    dispositionDate: String
    disposition: String
  }

  enum JurisdictionLevel {
    FEDERAL
    STATE
    LOCAL
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
    range: String!
    domain: String!
  }
  
  type Query {
    case(id: ID!): CourtCase
    cases(first: Int = 10, offset: Int = 0, sortBy: String, sortDirection: String = "ASC"): CourtCasePaginatedList!
    searchCases(caseStatus: String, filingDateStart: String, filingDateEnd: String, natureSuit: String, first: Int = 5, offset: Int = 0, sortBy: String, sortDirection: String = "ASC"): CourtCasePaginatedList!
    
    charge(id: ID!): Charge
    charges(first: Int = 10, offset: Int = 0, sortBy: String, sortDirection: String = "ASC"): ChargePaginatedList!
    searchCharges(chargeDescription: String, chargeSeverity: String, chargeStatus: String, filingDateStart: String, filingDateEnd: String, disposition: String, first: Int = 5, offset: Int = 0, sortBy: String, sortDirection: String = "ASC"): ChargePaginatedList!
    
    getFiltersForEntity(entity: String!): [PropertyInfo!]!
    
    getAutoCompleteData(field: String, value: String): [String!]!
  }
`

