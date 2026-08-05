const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const paystackSignature = event.headers['x-paystack-signature'];
  if (!paystackSignature) {
    return {
      statusCode: 401,
      body: 'Missing x-paystack-signature header'
    };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }

  // Calculate HMAC SHA-512 signature
  const hash = crypto
    .createHmac('sha512', secret)
    .update(event.body)
    .digest('hex');

  // Verify signature
  if (hash !== paystackSignature) {
    return {
      statusCode: 400,
      body: 'Invalid signature'
    };
  }

  const payload = JSON.parse(event.body);

  // We are interested in charge.success event
  if (payload.event === 'charge.success') {
    const reference = payload.data.reference;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing');
      return {
        statusCode: 500,
        body: 'Database configuration missing'
      };
    }

    try {
      // Fetch matching orders by payment reference
      const getResponse = await fetch(`${supabaseUrl}/rest/v1/orders?payment_reference=eq.${encodeURIComponent(reference)}`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });

      if (!getResponse.ok) {
        throw new Error(`Failed to fetch order: ${getResponse.statusText}`);
      }

      const orders = await getResponse.json();

      if (orders && orders.length > 0) {
        // Update all orders matching this payment reference to is_paid = true
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?payment_reference=eq.${encodeURIComponent(reference)}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            is_paid: true,
            order_status: 'pending'
          })
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update order status: ${updateResponse.statusText}`);
        }

        console.log(`Successfully updated order payment status for reference: ${reference}`);
      } else {
        console.warn(`No orders found matching reference: ${reference}`);
      }
    } catch (err) {
      console.error('Error updating order in Supabase:', err);
      return {
        statusCode: 500,
        body: `Database update failed: ${err.message}`
      };
    }
  }

  return {
    statusCode: 200,
    body: 'Webhook handled successfully'
  };
};
