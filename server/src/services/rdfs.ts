import fs from 'fs';
import { parse, graph, Namespace } from 'rdflib';
import { Ontology, ClassDefinition, PropertyInfo } from '../types/rdf';

/**
 * Parse RDF/XML schema into a structured ontology object
 * @param filePath Path to the RDF/XML schema file
 * @returns Ontology object containing class definitions and namespace information
 */
export function parseRDFSchema(filePath: string): Ontology {
    // Read file content
    const rdfData = fs.readFileSync(filePath).toString();

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