import { findAll } from "./../controllers/alerts";
import { courtCase } from "../jsonld/case";
import { testCourtCases } from "./test-cases";
import { parseResolveInfo, ResolveTree, simplifyParsedResolveInfoFragmentWithType } from "graphql-parse-resolve-info";
import { Converter, ISingularizeVariables, IVariablesDictionary } from "graphql-to-sparql";
import { toSparql } from "sparqlalgebrajs";
import type { GraphQLResolveInfo } from "graphql";
import { parse, GraphQLType, visit, Kind } from "graphql";
import { Client } from "graphql-ld";
import { QueryEngine } from "@comunica/query-sparql";
import { QueryEngineComunica } from "graphql-ld-comunica";
import { get } from "http";
import { IConvertOptions } from "graphql-to-sparql/lib/IConvertOptions";
import { rdfParser } from "rdf-parse";
import fs from "fs";
import { PropertyInfo } from "types/rdf";
import { parseRDFSchema } from "../services/rdfs";
const myEngine = new QueryEngine();

function getSourceFromResolveInfo(resolveInfo: GraphQLResolveInfo) {
  return resolveInfo.operation.loc.source.body;
}

function replaceSecondOccurrence(str, find, replace) {
  const firstIndex = str.indexOf(find);
  if (firstIndex === -1) return str;

  const secondIndex = str.indexOf(find, firstIndex + 1);
  if (secondIndex === -1) return str;

  return str.substring(0, secondIndex) + replace + str.substring(secondIndex + find.length);
}

function secondIndexOf(str, find) {
  const firstIndex = str.indexOf(find);
  if (firstIndex === -1) return -1;

  return str.indexOf(find, firstIndex + 1);
}

function extractFieldsFromQuery(query: string): string[] {
  const ast = parse(query);
  const fields: string[] = [];

  visit(ast, {
    Field(node) {
      // Look for fields inside the nodes object
      if (node.name.value === "nodes" && node.selectionSet) {
        node.selectionSet.selections.forEach((selection) => {
          if (selection.kind === Kind.FIELD) {
            fields.push(selection.name.value);
          }
        });
      }
    },
  });

  return fields;
}

function getFieldValue(query: string, fieldName: string): any {
  const ast = parse(query);
  let fieldValue = null;

  visit(ast, {
    Argument(node) {
      // Check if this argument has the name we're looking for
      if (node.name.value === fieldName) {
        // Extract the value based on its kind
        switch (node.value.kind) {
          case Kind.INT:
          case Kind.FLOAT:
          case Kind.STRING:
          case Kind.BOOLEAN:
            fieldValue = node.value.value;
            break;
          case Kind.VARIABLE:
            fieldValue = `$${node.value.name.value}`;
            break;
          case Kind.LIST:
          case Kind.OBJECT:
            // For complex values, you might need more processing
            fieldValue = node.value;
            break;
        }
      }
    },
  });

  return fieldValue;
}
// In resolvers.ts
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
      function reformatGraphQLQuery(query: string, args: { first: number, offset: number, sortBy: string, sortDirection: string }): string {
        // Find all placeholder parameters
        const paramRegex = /\s+(\w+):\s+\$(\w+)/g;
        const matches = [...query.matchAll(paramRegex)];

        // Keep only parameters that exist in args
        const validParams = matches
          .filter(([, , placeholder]) => placeholder in args)
          .map(([fullMatch, paramName, placeholder]) => {
            const value = typeof args[placeholder] === "string" ? `"${args[placeholder]}"` : args[placeholder];
            return { fullMatch, paramName, value };
          });

        // Create a new query with only valid parameters
        let updatedQuery = query;

        // Remove all parameter lines first
        for (const match of matches) {
          updatedQuery = updatedQuery.replace(match[0], "");
        }

        // Insert valid parameters with commas
        if (validParams.length > 0) {
          const paramLines = validParams.map(({ paramName, value }) => `    ${paramName}: ${value}`).join(",\n");

          // Insert after the function name and opening parenthesis
          const funcNamePos = updatedQuery.indexOf("cases(") + "cases(".length;
          updatedQuery = updatedQuery.slice(0, funcNamePos) + "\n" + paramLines + "\n" + updatedQuery.slice(funcNamePos);
        }

        // Clean up any empty lines
        updatedQuery = updatedQuery.replace(/\n\s*\n/g, "\n");

        return updatedQuery;
      }
      const { first = 5, offset = 0, sortBy = "filingDate", sortDirection = "ASC" } = args;
      const querySrc = info.operation.loc.source.body;

      const queryArgs = { ...args };
      delete queryArgs.sortBy;
      delete queryArgs.sortDirection;
      delete queryArgs.caseStatus;


      const optionalFields = new Set(["terminatingDate", "cause", "natureSuit"]);
      const queryBase = querySrc.slice(querySrc.indexOf("searchCases"));


      let queryWithArgs = reformatGraphQLQuery(queryBase, queryArgs);
      console.log(queryWithArgs);
      return [];
    },
    getFiltersForEntity: async (_: any, { entity }: { entity: string }, context, info) => {
      const properties = parseRDFSchema('/home/engineer/Data/ontologies/scales-2.rdf');
      console.log(properties);
      return properties.classes.find(c => c.name === entity)?.properties;
    },

    getAutoCompleteData: async (_: any, { field, value }: { field: string; value: string }, context, info) => {
      const querySrc = info.operation.loc.source.body;
      const pred = courtCase["@context"][field];
      const query = `SELECT DISTINCT ?${field} WHERE { ?s <${pred}> ?${field} .\n FILTER (CONTAINS(LCASE(?${field}), "${value.toLowerCase()}")) } LIMIT 20`;
      console.log(query);
      const bindingsStream = await myEngine.queryBindings(query, {
        sources: ["https://frink.apps.renci.org/federation/sparql"],
      });
      const results = [];
      for await (const binding of bindingsStream) {
        results.push(binding.get(field).value);
      }
      // bindingsStream.on("data", (binding) => {
      //   results.push(binding.get(field).value);
      // });
      return results;
    },
    searchCases: async (_: any, args: any, context, info) => {
      interface Args {
        [key: string]: any;
      }


      // Example usage
      //       const query = `searchCases(
      //     caseStatus: $caseStatus
      //     filingDateStart: $filingDateStart
      //     filingDateEnd: $filingDateEnd
      //     natureSuit: $natureSuit
      //     first: $first
      //     offset: $offset
      //     sortBy: $sortBy
      //     sortDirection: $sortDirection
      //   ) {
      //     nodes {
      //       caseId
      //       caseStatus
      //       filingDate
      //       terminatingDate
      //       natureSuit
      //       cause
      //       __typename
      //     }
      //     offset
      //     first
      //     hasMore
      //     __typename
      //   }
      // }`;

      const args2 = { first: 5, offset: 0, sortBy: "filingDate", sortDirection: "DESC" };
      // console.log(updateGraphQLQuery(query, args2));
      try {
        // Extract the variables that are causing problem        // Remove them from args before conversion
        const queryArgs = { ...args };
        delete queryArgs.first;
        delete queryArgs.offset;
        delete queryArgs.sortBy;
        delete queryArgs.sortDirection;
        delete queryArgs.caseStatus;

        // Get the query source
        const querySrc = info.operation.loc.source.body;
        const singularizeVariables = {
          caseId: true,
          caseStatus: true,
          cause: true,
          filingDate: true,
          natureSuit: true,
          terminatingDate: true,
        };

        const testQuery = `
          query @plural {
            case (first: 50, offset: 0){
              __typename
              caseStatus
              caseId
              filingDate
              terminatingDate
              natureSuit
              caseName @optional
            }
          }
        `;

        function transformGraphQLQuery(query) {
          // Regular expression to match the @plural directive and its arguments
          const pluralRegex = /@plural\s*\(\s*([\s\S]*?)\s*\)\s*{/;

          // Extract the arguments from @plural
          const match = query.match(pluralRegex);
          if (!match) return query; // Return original if no match

          const args = match[1];

          // Remove the @plural directive and its arguments
          let newQuery = query.replace(pluralRegex, "{");

          // Add the arguments to "case"
          newQuery = newQuery.replace(/case\s*{/, `case(${args}) {`);

          return newQuery;
        }

        const optionalFields = new Set(["terminatingDate", "cause", "natureSuit"]);
        const formattedQuery = querySrc.slice(querySrc.indexOf("searchCases"));
        let queryWithArgs = updateGraphQLQuery(formattedQuery, args);
        // for (const field of optionalFields) {
        //   queryWithArgs = queryWithArgs.replace(field, `${field} @optional`);
        // }
        // let finalQuery = queryWithArgs
        //   .replace("searchCases", "query @plural")
        //   .replace("nodes", "case")
        //   .replace("caseStatus", "")
        //   .replace(/__typename/g, "")
        //   .slice(0, -1);
        // finalQuery = transformGraphQLQuery(finalQuery);
        // console.log(finalQuery);
        // console.log(querySrc.slice(querySrc.indexOf("searchCases")));
        // args["first"] = "50";
        // console.log(args);
        const masterQuery = `
        SELECT ?case_caseId ?case_caseStatus ?case_filingDate ?case_terminatingDate ?case_natureSuit ?case_cause WHERE {
          ?df_3_0 <http://release.niem.gov/niem/domains/jxdm/7.2/#Case> ?case.
          ?case <http://release.niem.gov/niem/niem-core/5.0/CaseDocketID> ?case_caseId;
            <http://release.niem.gov/niem/niem-core/5.0/StartDate> ?case_filingDate.
          OPTIONAL { ?case <http://release.niem.gov/niem/niem-core/5.0/StatusDescriptionText> ?case_caseStatus. }
          OPTIONAL { ?case <http://release.niem.gov/niem/niem-core/5.0/EndDate> ?case_terminatingDate. }
          OPTIONAL { ?case <http://release.niem.gov/niem/niem-core/5.0/CaseSubCategoryText> ?case_natureSuit. }
          OPTIONAL { ?case <http://release.niem.gov/niem/niem-core/5.0/StatuteKeywordText> ?case_cause. }
        }
        LIMIT 50
        `;
        const algebra = await new Converter().graphqlToSparqlAlgebra(
          masterQuery,
          {
            "@context": {
              case: "http://release.niem.gov/niem/domains/jxdm/7.2/#Case",
              caseId: { "@id": "http://release.niem.gov/niem/niem-core/5.0/CaseDocketID" },
              caseStatus: "http://release.niem.gov/niem/niem-core/5.0/StatusDescriptionText",
              filingDate: "http://release.niem.gov/niem/niem-core/5.0/StartDate",
              filingStartDate: "http://release.niem.gov/niem/niem-core/5.0/StartDate",
              terminatingDate: "http://release.niem.gov/niem/niem-core/5.0/EndDate",
              cause: "http://release.niem.gov/niem/niem-core/5.0/StatuteKeywordText",
              natureSuit: "http://release.niem.gov/niem/niem-core/5.0/CaseSubCategoryText",
              caseName: "http://release.niem.gov/niem/niem-core/5.0/StatuteKeywordText",
              // nodes: { "@id": "http://www.w3.org/ns/hydra/core#member", "@container": "@list" },
            },
          },
          { singularizeVariables: singularizeVariables }
        );

        // Add pagination manually to the SPARQL query
        // This is a basic approach - you may need to adjust based on the SPARQL algebra structure
        const sparqlQuery = toSparql(algebra);
        // const finalSparql = addPaginationToSparql(sparqlQuery, first, offset, sortBy, sortDirection);
        const bindingsStream = await myEngine.queryBindings(sparqlQuery, {
          sources: ["https://frink.apps.renci.org/federation/sparql"],
        });
        const results = [];
        for await (const binding of bindingsStream) {
          results.push(binding);
        }

        console.log(sparqlQuery);

        // Execute query...
        // Rest of your implementation
      } catch (error) {
        console.error("Error in searchCases resolver:", error);
        // Fall back to test data
        return {
          nodes: testCourtCases,
          totalCount: testCourtCases.length,
          offset: args.offset || 0,
          first: args.first || 5,
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
  caseId?: string;
  caseStatus?: string;
  filingDate?: string;
  terminatingDate?: string;
  natureSuit?: string;
  cause?: string;
}

function convertBindingsToCourtCase(binding): CourtCase {
  const courtCase: CourtCase = {};

  if (binding.has("caseId")) courtCase.caseId = binding.get("caseId").value;
  if (binding.has("caseStatus")) courtCase.caseStatus = binding.get("caseStatus").value;
  if (binding.has("filingDate")) courtCase.filingDate = binding.get("filingDate").value;
  if (binding.has("terminatingDate")) courtCase.terminatingDate = binding.get("terminatingDate").value;
  if (binding.has("natureSuit")) courtCase.natureSuit = binding.get("natureSuit").value;
  if (binding.has("cause")) courtCase.cause = binding.get("cause").value;

  return courtCase;
}
function updateGraphQLQuery(formattedQuery: any, args: any) {
  console.log(formattedQuery);
}

