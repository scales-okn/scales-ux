/**
 * Represents information about a property in an RDF schema
 */
export interface PropertyInfo {
    /** The name of the property */
    name: string;
    /** The type of property - either an object property (relationship to another class) or data property (literal value) */
    type: 'object' | 'data';
    /** The range of the property (what type of values it can have) */
    range: string;
    /** The domain of the property (which class it belongs to) */
    domain: string;
}

/**
 * Represents the definition of a class in the ontology
 */
export interface ClassDefinition {
    /** The iri of the class */
    iri: string;
    /** The name of the class */
    name: string;
    /** Array of IRIs names that inherit from this class */
    subclasses: ClassDefinition[];
    /** Array of properties that belong to this class */
    properties: PropertyInfo[];
}

/**
 * Represents the complete structure of an RDF ontology
 */
export interface Ontology {
    /** Map of class names to their definitions */
    classes: ClassDefinition[];
    /** Namespace information for the ontology */
    namespaces: Record<string, string> | null;
} 