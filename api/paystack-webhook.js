const crypto = require('crypto');

// Disable automatic body parsing to get the raw body stream for signature verification
const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

const handler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const paystackSignature = req.headers['x-paystack-signature'];
  if (!paystackSignature) {
    return res.status(401).send('Missing x-paystack-signature header');
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    return res.status(500).send('Internal Server Error');
  }

  try {
    const rawBody = await getRawBody(req);
    
    // Calculate HMAC SHA-512 signature
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    // Verify signature
    if (hash !== paystackSignature) {
      return res.status(400).send('Invalid signature');
    }

    const payload = JSON.parse(rawBody.toString());

    // We are interested in charge.success event
    if (payload.event === 'charge.success') {
      const reference = payload.data.reference;

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing');
        return res.status(500).send('Database configuration missing');
      }

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
    }

    return res.status(200).send('Webhook handled successfully');
  } catch (err) {
    console.error('Error handling Paystack webhook:', err);
    return res.status(500).send(`Webhook handling failed: ${err.message}`);
  }
};

module.exports = handler;
module.exports.config = config;
