import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    
    // Check if this is a public guest tracking query searching by order ID or trackid
    const isTrackingQuery = ctx.query.filters && (
      ((ctx.query.filters as any).trackid) || 
      ((ctx.query.filters as any).id) || 
      ((ctx.query.filters as any).documentId)
    );

    if (!user && !isTrackingQuery) {
      return ctx.unauthorized("You must be logged in to view your orders.");
    }

    if (user) {
      // Force filter orders by the logged-in user's database ID
      ctx.query.filters = {
        ...(ctx.query.filters || {}),
        customer_account: {
          id: user.id
        }
      };
    }
        
    // Call default core find action
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async create(ctx) {
    const user = ctx.state.user;

    // Automatically link the logged-in user if authenticated
    if (user) {
      if (!ctx.request.body.data) {
        ctx.request.body.data = {};
      }
      ctx.request.body.data.customer_account = user.documentId || user.id;
    }

    // Call default core create action
    const response = await super.create(ctx);
    console.log("this is from response",response);
    return response;
  }
}));
