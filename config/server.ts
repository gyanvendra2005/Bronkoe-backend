// import type { Core } from '@strapi/strapi';

// const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   app: {
//     keys: env.array('APP_KEYS')!,
//   },
//   webhooks: {
//     populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
//   },
// });

// export default config;

import type { Core } from '@strapi/strapi';

console.log('RAW APP_KEYS EXISTS:', !!process.env.APP_KEYS);
console.log(
  'APP_KEYS LENGTH:',
  process.env.APP_KEYS?.split(',').length
);

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

  app: {
    keys: env.array('APP_KEYS')!,
  },

  webhooks: {
    populateRelations: env.bool(
      'WEBHOOKS_POPULATE_RELATIONS',
      false
    ),
  },
});

export default config;
