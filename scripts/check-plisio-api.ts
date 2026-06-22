import 'dotenv/config';
import { SYSTEM_CONFIG } from '../lib/config/system';

async function main() {
  const secretKey = SYSTEM_CONFIG.plisio.secretKey;
  if (!secretKey) {
    console.error('Plisio secret key not found in system config');
    return;
  }

  const txnIds = [
    '6a38c14233fb4c0895003214',
    '6a38cf37150a7f14f1087127',
    '6a38d19034d7b5760409fc8c',
    '6a390ed9c1be1f4a12018a40'
  ];

  for (const txnId of txnIds) {
    console.log(`\n--------------------------------------------`);
    console.log(`Checking Plisio Txn: ${txnId}`);
    try {
      // 1. Try operations endpoint
      const opUrl = `https://plisio.net/api/v1/operations/${txnId}?api_key=${secretKey}`;
      const opRes = await fetch(opUrl);
      const opData = await opRes.json();
      console.log(`[Operations API Result]:`);
      console.log(JSON.stringify(opData, null, 2));

      // 2. Try invoice endpoint (if it exists)
      const invUrl = `https://plisio.net/api/v1/invoices/${txnId}?api_key=${secretKey}`;
      const invRes = await fetch(invUrl);
      const invData = await invRes.json().catch(() => ({ error: 'Not json' }));
      console.log(`[Invoice API Result]:`);
      console.log(JSON.stringify(invData, null, 2));

    } catch (e: any) {
      console.error(`Error querying transaction ${txnId}:`, e.message);
    }
  }
}

main().catch(err => console.error(err));
