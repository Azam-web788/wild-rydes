import { defineData, defineFunction } from '@aws-amplify/backend';
import { a } from '@aws-amplify/data-schema';

const requestUnicorn = defineFunction({
  name: 'requestUnicorn',
  entry: './requestUnicorn.js',
});

const schema = a.schema({
  Ride: a.model({
    RideId: a.id().required(),
    UnicornName: a.string(),
    UnicornColor: a.string(),
    ETA: a.string(),
  }).authorization((allow) => [allow.owner()]),
});

export const data = defineData({
  schema,
});