# satyrn-ux
The frontend repo for public-facing version of Satyrn's UX

## Dependencies
NodeJs - https://nodejs.org/en/

NPM

## Server

### Database

For local development make sure to have a Postgres instance up and running.
https://www.codecademy.com/article/installing-and-using-postgresql-locally

### Configuration
Create a file called .env in ./sever/.env

Copy and complete the .env.example variables

### Running
```
cd server 
npm install
npm run start
```

## Client

### Configuration

Create a file callend .env in ./client/.env

Copy and complete the .env.example variables

### Running
```
cd client 
npm install
npm run start
```

### For testing purposes:

User: user@testing.test:Pass-word-25

Admin: admin@testing.test:Pass-word-25

## API Spec v0.1 (Ported from satyrn-platform for reference)

The API currently supports six primary views, five of which are documented below.

1. __/api/__

This is just a basic health check, though we can repurpose as necessary.

 ----

2. __/api/info/__

This is an endpoint for passing metadata about how the UI should be built/behave on init. The contents are automatically generated from the contents of the satconf file. Includes: 1) the available filters and their types, 2) the column names/order/widths as well as which ones are sortable and the default sort, and 3) the analysis space components (for dynamic generation of analysis statements on the frontend). Additional documentation TBD.

An example follows:

```javascript
{
  "filters": [ // <-- a list of tuples (lists), each entry defining an available data filter
    [
      "causeOfAction", // <-- name for building url strings/code-level representation
      {
          autocomplete: false, // <-- whether auto-completable or not (via ac endpoint)
          type: "text", // <-- type is currently text or date, need to introduce int/range
          allowMultiple: false, // <-- does it make sense to allow multiple filters of this type?
          nicename: "Cause of Action", // <-- name for the UI
          desc: "Reason for lawsuit" // <-- annotation for UI description
      }
    ], ...
  ],
  "columns": [ // <-- list of objects, each one defining a column to display on UI
    {
      key: "caseName", // <-- key in the results payload (see results endpoint)
      nicename: "Case Name", // <-- column header name on UI
      width: "34%", // <-- display width of column
      sortable: true // <-- whether column should be sortable on UI (see results endpoint)
    }, ...
  ],
  "defaultSort": { // <-- object that defines which col is sorted by default + direction
    key: "dateFiled",
    direction: "desc"
  },
  "operations": { // <-- the available operations space for generating statements
    average: { // <-- operation entry
      dataTypes: [ // <-- datatypes this operates on
        "float",
        "int"
      ],
      neededFields: [ // <-- requirements for analysis, here "what is the targetField?"
        "targetField"
      ],
        units: "unchanged", // <-- does this analysis change the nature of the targetField's units?
        nicename: "Average" // <-- name for UI
    },
  },
  "analysisSpace": [ // <-- list of objects defining features of data that analysis can run on
    {
      type: "float", // <-- datatype of this entry
      fieldName: [ // <-- nicename of fields for UI in [singular, plural]
        "Case Duration",
        "Case Durations"
      ],
      unit: [ // <-- units of this field in [singular, plural]
        "day",
        "days"
      ],
      targetField: "caseDuration" // <-- the field(s) under the hood associated with this entry
    },
  ],
  "fieldUnits": { // <-- maps fields in the analysisSpace to their units, makes lookup easier
    caseDuration: [
      "day", // <-- singular
      "days" // <-- plural
    ],
  },
  "includesRenderer": true, // <-- tells frontend if items in the results view should be clickable
  "targetModelName" // <-- for UI to reference the type of results
}
```

 ----

3. __/api/results/__

This is the primary search endpoint, and it takes a list of search params (or none to browse all available cases). The available search space is defined by the config (as noted above, see satyrn-templates for examples and docs).

In addition to the search params, this also takes optional `page=[int]` and `batchSize=[int]` params that define the size of the slice of results and the "page" of that size to be returned (supporting pagination on the UI). If left off, these default to page=0 and batchSize=10

This will return objects that look like:

```python
{
  "totalCount": {int}, # <-- the total count of all results for the query
  "page": {int}, # <-- the page of results returned
  "batchSize": {int}, # <-- the max size of the batch returned
  "activeCacheRange": [{int}, {int}], # <-- the cache range this result is within on the server
  "results": [] # <-- the actual list of cases that matched this search
}
```

Examples (which work with the SCALES ring, but are included for reference):
 - `/api/results/?dateFiled=[2013-10-10,2013-12-15]`
 - `/api/results/?judgeName=Gotsch&caseName=Moton&sortBy=caseName&sortDir=asc`
 - `/api/results/?attorneys=Baldwin&attorneys=Dana&caseName=National%20Mutual`

 ----

4. __/api/autocomplete/__

An autocomplete endpoint. It takes a `type=[relevant key from config]` and an optional `query=[partial string to be shown options for]`. The query param only works on functions that have implemented support for it. See `searchSpace.py` for how they're mapped to types, and then `autocompleters.py` for the functions themselves.

Examples (from the SCALES ring):
 - `/api/autocomplete/?type=districts` (note: no query param supported at this endpoint)
 - `/api/autocomplete/?type=judgeName&query=abr`

 ----

5. __/api/result/<item_id>__

An endpoint to view results that have a `get_clean_html` method on their target model. Takes the same set of get parameters as /results/, and highlights elements on page accordingly.

Example (from SCALES ring): `/api/result/1-13-cv-07293%7C%7C%7C1:13-cv-07293?caseName=Nationwide%20Mutual&attorneys=Baldwin&attorneys=Kanellakes`

6. __/api/analysis/__

#TODO

///
