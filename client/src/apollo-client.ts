import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

const httpLink = new HttpLink({
  uri: "/api/graphql", // Adjust this to your GraphQL endpoint
})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

