import { gql } from '@apollo/client';

export const GET_VALUE = gql`
  query GetValue {
    value
  }
`;

export const VALUE_SUBSCRIPTION = gql`
  subscription OnValueChanged {
    value
  }
`;

export const UPDATE_SCORE = gql`
  mutation UpdateScore($delta: Int!) {
    increment(value: $delta)
  }
`;
