import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL,
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WS_URL!,
    lazy: true,
    retryAttempts: 5,
    connectionAckWaitTimeout: 5000,
    connectionParams: {
      chainId: process.env.REACT_APP_CHAIN_ID,
      applicationId: process.env.REACT_APP_APPLICATION_ID,
    },
    on: {
      connecting: () => console.log('[WS] connecting'),
      connected: () => console.log('[WS] connected'),
      closed: (event) => console.log('[WS] closed', event),
      error: (err) => console.error('[WS] error', err),
    },
  })
);

// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Initialize Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
