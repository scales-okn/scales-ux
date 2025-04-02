import { Request, Response } from "express";
import fs from "fs";
import { rdfParser } from "rdf-parse";
import { PropertyInfo } from "../types/rdf";

export const searchGraph = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    console.log("query", query);
    return res.send_ok("", {});
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

export const getSchema = async (_req: Request, res: Response) => {
  try {
    const schema = await getSchemaFromGraph();
    return res.send_ok("", { schema });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

const getSchemaFromGraph = async () => {
  // read rdf xml file
  const readableStream = fs.createReadStream("server/src/ontology/schema.rdf");
  const schema = await rdfParser.parse(readableStream, {
    baseIRI: "http://www.semanticweb.org/ontologies/2015/1/schema",
    path: "/home/engineer/Data/ontologies/scales-2.rdf",
  });

  return schema;
};

const getFiltersForEntity = async (entity: string): Promise<PropertyInfo[]> => {
  const schema = await getSchemaFromGraph();
  const properties: PropertyInfo[] = [];

  // Create a map to store property information
  const propertyMap = new Map<string, PropertyInfo>();

  // Process the quads to build property information
  for await (const quad of schema) {
    const { subject, predicate, object } = quad;

    // If this is a property definition
    if (predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
      object.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property') {
      propertyMap.set(subject.value, {
        name: subject.value.split('#').pop() || '',
        type: 'data', // default to data property
        range: '',
        domain: '',
        iri: subject.value
      });
    }

    // If this is a range definition for a property
    if (predicate.value === 'http://www.w3.org/2000/01/rdf-schema#range') {
      const property = propertyMap.get(subject.value);
      if (property) {
        property.range = object.value;
        // If range is a class (not a datatype), it's an object property
        if (object.value.startsWith('http://www.semanticweb.org/ontologies/2015/1/schema#')) {
          property.type = 'object';
        }
      }
    }

    // If this is a domain definition for a property
    if (predicate.value === 'http://www.w3.org/2000/01/rdf-schema#domain') {
      const property = propertyMap.get(subject.value);
      if (property) {
        property.domain = object.value;
      }
    }
  }

  // Filter properties that belong to the requested entity
  for (const [_, property] of propertyMap) {
    if (property.domain === `http://www.semanticweb.org/ontologies/2015/1/schema#${entity}`) {
      properties.push(property);
    }
  }

  return properties;
};

// propertyStatements.forEach(stmt => {
//   const propIriSet = new Set<string>();
//   const propertyUri = stmt.subject.value;
//   if (propIriSet.has(propertyUri)) {
//     return;
//   }
//   const propertyName = propertyUri.split('#').pop() || '';

//   // Get property range
//   const rangeStmt = store.any(stmt.subject, RDFS('range'), null);
//   const range = rangeStmt ? rangeStmt.value : '';

//   const labelStmt = store.any(stmt.subject, RDFS('label'), null);
//   const label = labelStmt ? labelStmt.value : propertyName;

//   // Check if this is an object property or data property
//   const isObjectProperty = store.any(stmt.subject, RDF('type'), OWL('ObjectProperty'));

//   const property: PropertyInfo = {
//     name: label,
//     type: isObjectProperty ? 'object' : 'data',
//     range: range,
//     domain: classUri
//   };

//   classDef.properties.push(property);
//   propIriSet.add(propertyUri);
// });