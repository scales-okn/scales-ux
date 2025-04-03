import { QueryEngine } from "@comunica/query-sparql";
import { Converter } from "graphql-to-sparql";
import { Converter as TreeConverter } from "sparqljson-to-tree";
import { toSparql } from "sparqlalgebrajs";
import { Filter } from "types/filter";
import { courtCase } from "../jsonld/case";
import { getFiltersForEntity } from "../services/rdfs";
import { testCourtCases } from "./test-cases";
const myEngine = new QueryEngine();

const optionalFields = new Set(["terminatingDate", "cause", "natureSuit", "caseCharge", "charges", "caseGeneralCategory"]);
const singularizeVariables = {
  caseDocketId: true,
  caseStatus: true,
  filingDate: true,
  terminatingDate: true,
  natureSuit: true,
};

const transformGraphQLQuery = (query: string, args: any, optionalFields: Set<string>) => {
  const { sortBy, sortDirection } = args;
  delete args.sortBy;
  delete args.sortDirection;
  let queryBase = query.slice(query.indexOf("{") + 1, query.lastIndexOf("}"));
  queryBase = queryBase.slice(queryBase.indexOf("{") + 1, queryBase.lastIndexOf("}"));
  let queryWithArgs = queryBase.replace("cases", "query cases");
  for (const key in args) {
    // test to see if the value is a string. if so surround it with quotes
    if (typeof args[key] === 'string') {
      queryWithArgs = queryWithArgs.replace(`$${key}`, `"${args[key]}"`);
    } else {
      queryWithArgs = queryWithArgs.replace(`$${key}`, `${args[key]}`);
    }
  }
  for (const key in args) {
    if (key in args) {
      queryWithArgs = queryWithArgs.replace(`${key}: ${args[key]}`, `$${key}: ${key} = ${args[key]}`);
    } else {
      // use regex to remove all occurrences of the key from the query, including possible trailing commas
      queryWithArgs = queryWithArgs.replace(new RegExp(`${key}:[^,)]*[,)]?\\s*`, 'g'), '');
    }

  }
  queryWithArgs = queryWithArgs.replace('nodes', 'nodes($first: Int, $offset: Int)');
  queryWithArgs = queryWithArgs.replace(", {", ") {");
  for (const field of optionalFields) {
    queryWithArgs = queryWithArgs.replace(field, `${field} @optional`);
  }
  return queryWithArgs;
}

export const queryResolvers = {
  Query: {
    case: async (_: any, { caseId }: { caseId: string }, context, info) => {
      // const querySrc = info.operation.loc.source.body;
      // const pred = courtCase["@context"][field];
      // const query = `SELECT DISTINCT ?${field} WHERE { ?s <${pred}> ?${field} .\n FILTER (CONTAINS(LCASE(?${field}), "${value.toLowerCase()}")) } LIMIT 10`;
      // console.log(query);
      return {};
    },
    cases: async (_: any, args, context, info) => {

      const querySrc: string = info.operation.loc.source.body;
      const queryWithArgs = transformGraphQLQuery(querySrc, args, optionalFields);
      console.log("queryWithArgs in cases resolver\n", queryWithArgs);
      const algebra = await new Converter().graphqlToSparqlAlgebra(
        queryWithArgs,
        { "@context": courtCase["@context"] },
        { variablesDict: args }
      );
      const sparqlQuery = toSparql(algebra);
      console.log("sparqlQuery in cases resolver\n", sparqlQuery);
      try {
        const bindingsStream = await myEngine.queryBindings(sparqlQuery, {
          sources: ["https://frink.apps.renci.org/federation/sparql"],
        });
        const results = [];
        for await (const binding of bindingsStream) {
          results.push({
            caseDocketId: binding.get("nodes_caseDocketId")?.value || "null field",
            caseStatus: binding.get("nodes_caseStatus")?.value || "null field",
            filingDate: binding.get("nodes_filingDate")?.value || "null field",
            terminatingDate: binding.get("nodes_terminatingDate")?.value || "null field",
            natureSuit: binding.get("nodes_natureSuit")?.value || "null field",
          });
        }
        // const treeResults = await new TreeConverter().sparqlJsonResultsToTree(bindingsStream);
        // console.log("results in cases resolver", results);
        console.log("results in cases resolver", results);
        return { nodes: results, totalCount: results.length, offset: 0, first: 10, hasMore: false };
      } catch (error) {
        console.error("Error in cases resolver:", error);
        return [];
      }
    },
    getFiltersForEntity: async (_: any, { entity }: { entity: string }, context, info): Promise<Filter[]> => {
      return getFiltersForEntity(entity);
    },

    getAutoCompleteData: async (_: any, { field, value }: { field: string; value: string }, context, info) => {
      console.log("getAutoCompleteData", field, value);
      const querySrc = info.operation.loc.source.body;
      const pred = courtCase["@context"][field];
      const results = [];
      let filter = "";
      if (value && value.length > 0) {
        filter = `FILTER (CONTAINS(LCASE(?${field}), "${value.toLowerCase()}"))`;
      }
      const query = `SELECT DISTINCT ?${field} WHERE { ?s <${pred}> ?${field} .\n ${filter} } LIMIT 20`;
      console.log(query);
      const bindingsStream = await myEngine.queryBindings(query, {
        sources: ["https://frink.apps.renci.org/federation/sparql"],
      });
      for await (const binding of bindingsStream) {
        results.push(binding.get(field).value);
      }
      console.log(`results for ${field}:${value} in getAutoCompleteData`, results);
      return results;
    },
    searchCases: async (_: any, args: any, context, info) => {
      const querySrc: string = info.operation.loc.source.body;
      let queryWithArgs = transformGraphQLQuery(querySrc, args, optionalFields).replace("searchCases", "query searchCases");
      queryWithArgs = queryWithArgs.replace("nodes", "query searchCases");

      console.log("queryWithArgs in cases resolver\n", queryWithArgs);
      try {
        const algebra = await new Converter().graphqlToSparqlAlgebra(
          queryWithArgs,
          courtCase,
          { singularizeVariables: singularizeVariables }
        );

        // Add pagination manually to the SPARQL query
        // This is a basic approach - you may need to adjust based on the SPARQL algebra structure
        const sparqlQuery = toSparql(algebra);
        console.log("sparqlQuery in searchCases resolver\n", sparqlQuery);
        const finalSparql = addPaginationToSparql(sparqlQuery, args.first, args.offset, args.sortBy, args.sortDirection);
        // const finalSparql = addPaginationToSparql(sparqlQuery, first, offset, sortBy, sortDirection);
        const bindingsStream = await myEngine.queryBindings(finalSparql, {
          sources: ["https://frink.apps.renci.org/federation/sparql"],
        });
        const results = [];
        for await (const binding of bindingsStream) {
          const caseResult = convertBindingsToCourtCase(binding);
          results.push(caseResult);
        }

        console.log("results in searchCases resolver", results);
        // Execute query...
        return {
          nodes: results,
          totalCount: results.length,
          offset: args.offset || 0,
          first: args.first || 50,
          hasMore: false,
        };
      } catch (error) {
        console.error("Error in searchCases resolver:", error);
        // Fall back to test data
        return {
          nodes: testCourtCases,
          totalCount: testCourtCases.length,
          offset: args.offset || 0,
          first: args.first || 50,
          hasMore: false,
        };
      }
    },
  },
};

// Helper function to add pagination to SPARQL
function addPaginationToSparql(sparql, first, offset, sortBy, sortDirection) {
  // Remove any existing LIMIT/OFFSET
  let query = sparql.replace(/LIMIT \d+/i, "").replace(/OFFSET \d+/i, "");

  // Add ORDER BY if sortBy is specified
  if (sortBy) {
    const direction = sortDirection === "DESC" ? "DESC" : "ASC";

    // Map GraphQL field to SPARQL variable
    const sparqlVar = courtCase["@context"][sortBy];
    if (sparqlVar) {
      // Check if ORDER BY already exists
      if (!/ORDER BY/i.test(query)) {
        const orderByClause = `ORDER BY ${direction}(?${sortBy})`;
        // Insert before LIMIT if exists
        query = query.replace(/}$/, `${orderByClause} }`);
      }
    }
  }

  // Add LIMIT and OFFSET
  return query.replace(/}$/, `LIMIT ${first} OFFSET ${offset} }`);
}

// Helper function to convert SPARQL bindings to a CourtCase object
interface CourtCase {
  caseDocketId?: string;
  caseStatus?: string;
  filingDate?: string;
  terminatingDate?: string;
  natureSuit?: string;
  cause?: string;
}

function convertBindingsToCourtCase(binding): CourtCase {
  const courtCase: CourtCase = {};

  if (binding.has("nodes_caseDocketId")) courtCase.caseDocketId = binding.get("nodes_caseDocketId").value;
  if (binding.has("nodes_caseStatus")) courtCase.caseStatus = binding.get("nodes_caseStatus").value;
  if (binding.has("nodes_filingDate")) courtCase.filingDate = binding.get("nodes_filingDate").value;
  if (binding.has("nodes_terminatingDate")) courtCase.terminatingDate = binding.get("nodes_terminatingDate").value;
  if (binding.has("nodes_natureSuit")) courtCase.natureSuit = binding.get("nodes_natureSuit").value;

  return courtCase;
}
function updateGraphQLQuery(formattedQuery: any, args: any) {
  console.log(formattedQuery);
}

