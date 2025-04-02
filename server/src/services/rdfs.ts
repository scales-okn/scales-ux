import fs from 'fs/promises'
import { parse, graph, Namespace } from 'rdflib';
import { Ontology, ClassDefinition, PropertyInfo } from '../types/rdf';
import { Filter } from 'types/filter';
import { reverseMap } from './json-ld';
import { courtCase } from '../jsonld/case';

export async function getFiltersForEntity(entity: string): Promise<Filter[]> {
    const schema = await parseRDFSchema('/Users/engineer/Code/scales/scales-ux/server/config/rdf/scales-okn.rdf');
    const entityCtx = courtCase["@context"][entity]
    console.log("entityCtx", entityCtx);
    if (!entityCtx) {
        throw new TypeError(`${entity} does not exist in json-ld context`);
    }
    let entityIri;
    if (typeof entityCtx === 'string') {
        entityIri = entityCtx;
    } else {
        entityIri = entityCtx["@id"];
    }

    const entityClass = schema.classes.find(c => {
        if (c.iri === entityIri) {
            return c;
        }
        for (const prop of c.properties) {
            if (prop.iri === entityIri) {
                return prop;
            }
        }
    });
    if (!entityClass) {
        throw new TypeError(`${entity} does not exist in ontology`);
    }
    return buildFilters(entityClass, entity);
}

const popStem = (iri: string) => {
    // split the iri by the slash and pop the last value
    return iri.split('/').pop() || iri.split('#').pop() || 'UNKNOWN';
}

// const normalizeType = (type: string | { '@id': string, '@type'?: string } ) : string => {
//     // check to see if the type is an object with the @id property
//     if (typeof type === 'object' && type !== null && '@id' in type) {
//         return popStem(type['@id']);
//     }
//     return type;
// }
// /**
//  * Recursively build filters for a given class property
//  * @param classProps 
//  */
export function buildFilters(entityClass: ClassDefinition, entity: string): Filter[] {
    const predMap = reverseMap(courtCase["@context"]);
    const filters = [];
    const { name, iri, properties, subclasses } = entityClass
    if (subclasses.length > 0) {
        // build a | seperated string of the subclasses
        const value = subclasses.map(subClass => subClass.iri).join('|');
        const filter: Filter = {
            label: `${name} Type`,
            // split and pop everything after the last non alpha value from the iri
            type: 'type',
            field: predMap[iri] || 'missing json-ld field',
            value: "",
            subFilters: [],
            autoComplete: [],
        };
        for (const subclass of subclasses) {
            const subFilter: Filter = {
                label: subclass.name,
                type: 'type',
                field: predMap[subclass.iri] || 'missing json-ld field',
                value: "",
                subFilters: [],
                autoComplete: [],
            };

            filter.subFilters.push(subFilter);
            filter.autoComplete.push({ label: subclass.name, value: predMap[subclass.iri] || 'missing json-ld field' });
        }
        filters.push(filter);
    }
    for (const property of properties) {
        const filter: Filter = {
            label: property.name,
            type: property.type,
            field: predMap[property.iri] || 'missing json-ld field',
            value: "",
            subFilters: [],
            autoComplete: [],
        };
        filters.push(filter);
    }
    // const filter: Filter = {
    //     label: name,
    //     type: 'string',
    //     field: predMap[iri] || 'missing json-ld field',
    //     values: [],
    //     filters: []
    // };
    // if (subclasses.length > 0) {
    //     for (const subclass of subclasses) {
    //         filter.filters.concat(buildFilters([subclass], subclass.name));
    //     }
    // }
    // filters.push(filter);
    // }
    return filters;
}
/**
 * Parse RDF/XML schema into a structured ontology object
 * @param filePath Path to the RDF/XML schema file
 * @returns Ontology object containing class definitions and namespace information
 */
export async function parseRDFSchema(filePath: string): Promise<Ontology> {
    // Read file content
    const rdfData = (await fs.readFile(filePath)).toString();

    // Initialize RDF store
    const store = graph();
    const baseUrl = "http://schemas.scales-okn.org/rdf/scales#";
    const contentType = 'application/rdf+xml';

    // Define common RDF/OWL/RDFS namespaces
    const RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    const RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#");
    const OWL = Namespace("http://www.w3.org/2002/07/owl#");
    const SCALES = Namespace("http://schemas.scales-okn.org/rdf/scales#");
    const NIEM_JUSTICE = Namespace("http://release.niem.gov/niem/domains/jxdm/7.2/#");
    const NIEM_CORE = Namespace("http://release.niem.gov/niem/niem-core/5.0/");
    const FIPS = Namespace("http://release.niem.gov/niem/codes/fips/5.0/");
    // Parse RDF data into store
    try {
        parse(rdfData, store, baseUrl, contentType);

        // Initialize ontology structure
        const ontology: Ontology = {
            classes: [],
            namespaces: {
                rdf: RDF('').value,
                rdfs: RDFS('').value,
                owl: OWL('').value,
                scales: SCALES('').value,
                j: NIEM_JUSTICE('').value,
                nc: NIEM_CORE('').value,
                fips: FIPS('').value
            }
        };

        // Extract classes
        const classStatements = store.statementsMatching(null, RDF('type'), OWL('Class'));

        // First pass: Create class definitions
        classStatements.forEach(stmt => {
            const classUri = stmt.subject.value;
            const className = classUri.split('#').pop() || '';

            // Get class label
            const labelStmt = store.any(stmt.subject, RDFS('label'), null);
            const label = labelStmt ? labelStmt.value : className;

            // Get subclass relationship
            const subClassStmt = store.any(stmt.subject, RDFS('subClassOf'), null);
            const subClassOf = subClassStmt ? subClassStmt.value : null;

            const classDef: ClassDefinition = {
                iri: classUri,
                name: label,
                subclasses: [],
                properties: []
            };

            ontology.classes.push(classDef);

            // If this is a subclass, add it to its parent's subclasses array
            if (subClassOf) {
                const parentClass = ontology.classes.find(c => c.iri === subClassOf);
                if (parentClass) {
                    parentClass.subclasses.push(classDef);
                }
            }
        });

        // Second pass: Extract properties for each class
        ontology.classes.forEach(classDef => {
            const classUri = `${classDef.name}`;
            const classUriObject = store.sym(classDef.iri);

            // console.log("classUriObject", classUriObject);
            // Get all properties that have this class as their domain
            const propertyStatements = store.statementsMatching(null, RDFS('domain'), classUriObject);

            if (classDef.subclasses) {
                classDef.subclasses.forEach(subclass => {
                    const subclassUriObject = store.sym(subclass.iri);
                    const propertyStatements = store.statementsMatching(null, RDFS('domain'), subclassUriObject);
                    propertyStatements.push(...propertyStatements);
                });
            }

            propertyStatements.forEach(stmt => {
                const propertyUri = stmt.subject.value;
                const propertyName = propertyUri.split('#').pop() || '';
                // extract the last alapha value from the propertyUri using regex

                // Get property range
                const rangeStmt = store.any(stmt.subject, RDFS('range'), null);
                const range = rangeStmt ? rangeStmt.value : '';
                const typeId = rangeStmt.value.match(/[a-zA-Z]+$/)?.[0] || '';

                const labelStmt = store.any(stmt.subject, RDFS('label'), null);
                const label = labelStmt ? labelStmt.value : propertyName;

                // Check if this is an object property or data property
                const isObjectProperty = store.any(stmt.subject, RDF('type'), OWL('ObjectProperty'));

                const property: PropertyInfo = {
                    iri: propertyUri,
                    name: label,
                    type: typeId,
                    range: range,
                    domain: classUri
                };

                classDef.properties.push(property);
            });
        });
        return ontology;
    } catch (error) {
        console.error('Error parsing RDF/XML schema:', error);
        throw error;
    }
}