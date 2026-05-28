import { upsertPlans } from '../lib/roi-engine';

async function main() {
  await upsertPlans();
  console.log('Plans updated successfully.');
}

main().catch(console.error).finally(() => process.exit(0));
