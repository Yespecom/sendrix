
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  const id = 'b68f71fa-982e-46fe-bc1a-cc4ad883c3eb';
  
  const { data: product } = await supabase
    .from('products')
    .select('id, user_id, name')
    .eq('id', id)
    .single();
  console.log('Product Found:', !!product, product?.name);

  const { data: sequence } = await supabase
    .from('sequences')
    .select('id, status')
    .eq('product_id', id)
    .single();
  console.log('Sequence Found:', !!sequence, sequence?.status);

  if (product) {
    const { data: resend } = await supabase
      .from('resend_config')
      .select('id, from_email')
      .eq('user_id', product.user_id)
      .single();
    console.log('Resend Config Found:', !!resend, resend?.from_email);
  }
}

debug();
