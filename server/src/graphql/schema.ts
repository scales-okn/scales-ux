import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type CourtCase {
    caseDocketId: ID!
    caseGeneralCategory: String
    jurisdiction: String
    caseStatus: String
    filingDate: String
    natureSuit: String
    cause: String
    terminatingDate: String
    ontologyLabel: String
    charges: [Charge!]
    judge: Judge
    court: Court
    initiatingParty: Party
    respondentParty: Party
    defendant: Party
    docketTable: RegisterOfActions
    attorneys: [Attorney!]
  }

  type CriminalCase {
    caseDocketId: ID!
    caseGeneralCategory: String
    jurisdiction: String
    caseStatus: String
    filingDate: String
    terminatingDate: String
    charges: [Charge!]
    judge: Judge
    court: Court
    defendant: Party
    defenseCounsel: Attorney
    prosecutor: Attorney
  }

  type CivilCase {
    caseDocketId: ID!
    caseGeneralCategory: String
    jurisdiction: String
    caseStatus: String
    filingDate: String
    terminatingDate: String
    natureSuit: String
    cause: String
    judge: Judge
    court: Court
    initiatingParty: Party
    respondentParty: Party
    initiatingAttorney: Attorney
  }

  type Charge {
    chargeId: ID!
    chargeDescription: String
    chargeStatus: String
    chargeType: String
    disposition: String
    filingDate: String
    chargeSequenceId: String
    sentence: Sentence
  }

  type Sentence {
    sentenceId: ID!
    sentenceImposedText: String
    fineAmount: Float
    sentenceSubject: Person
  }

  type Judge {
    judgeId: ID!
    name: String
    judicialOfficialCategory: String
    commissionDate: String
    appointedByParty: Party
  }

  type Court {
    courtId: ID!
    name: String
    circuit: String
    location: Location
  }

  type Person {
    personId: ID!
    fullName: String
    race: String
    sex: String
  }

  type Party implements Person {
    personId: ID!
    fullName: String
    race: String
    sex: String
    caseOfficialRole: String
    participantRoleCategory: String
    highestOffenseLevelOpening: String
    highestOffenseLevelTerminated: String
    extraInfo: String
  }

  type Attorney implements Person {
    personId: ID!
    fullName: String
    race: String
    sex: String
    firm: Organization
  }

  type Organization {
    organizationId: ID!
    name: String
    location: Location
  }

  type Location {
    locationId: ID!
    address: String
    postalCode: String
    countryCode: String
  }

  type RegisterOfActions {
    registerId: ID!
    entries: [RegisterAction!]
  }

  type RegisterAction {
    actionId: ID!
    date: String
    description: String
    administrativeId: String
    judgeReference: Judge
    judgeAttribution: Judge
    referencesToOtherEntries: [RegisterAction!]
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
  
  interface Person {
    personId: ID!
    fullName: String
    race: String
    sex: String
  }
  
  type Query {
    case(id: ID!): CourtCase
    cases(
      first: Int = 10, 
      offset: Int = 0, 
      sortBy: String, 
      sortDirection: String = "Desc"
    ): CourtCasePaginatedList!
    
    searchCases(
      caseDocketId: String,
      caseStatus: String, 
      filingDateStart: String, 
      filingDateEnd: String, 
      natureSuit: String, 
      jurisdiction: String,
      first: Int = 5, 
      offset: Int = 0, 
      sortBy: String, 
      sortDirection: String = "ASC"
    ): CourtCasePaginatedList!
    
    criminalCases(
      first: Int = 10,
      offset: Int = 0,
      sortBy: String,
      sortDirection: String = "Desc"
    ): CourtCasePaginatedList!
    
    civilCases(
      first: Int = 10,
      offset: Int = 0,
      sortBy: String,
      sortDirection: String = "Desc"
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
    
    judge(id: ID!): Judge
    judges(
      first: Int = 10,
      offset: Int = 0,
      sortBy: String,
      sortDirection: String = "ASC"
    ): [Judge!]!
    
    court(id: ID!): Court
    courts(
      first: Int = 10,
      offset: Int = 0,
      sortBy: String,
      sortDirection: String = "ASC"
    ): [Court!]!
    
    getFiltersForEntity(entity: String!): [Filter!]!
    getAutoCompleteData(field: String, value: String): [String!]!
  }
`

