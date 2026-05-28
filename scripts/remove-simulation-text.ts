import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'components', 'translation-provider.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const keysToRemove = [
  'notifSandboxDesc',
  'notifSandboxTitle',
  'earningsEmpty',
  'overviewSimControls',
  'overviewSimStep4',
  'overviewNoActivity',
  'handoverDemo',
  'demoDisclaimerText',
  'demoDisclaimerBadge',
  'earningsGuideDesc',
  'earningsSimulateBtn',
  'earningsProcessingBtn',
  'arbitrageGuideDesc',
  'arbitrageSimulateBtn',
  'arbitrageProcessingBtn',
  'portfolioGuideDesc',
  'portfolioSimulateBtn',
  'portfolioProcessingBtn',
  'withdrawGuideDesc',
  'withdrawGuideStep1Title',
  'withdrawGuideStep1Sub',
  'withdrawSimulateBtn',
  'withdrawProcessingBtn',
  'depSimulate'
];

// Remove these keys everywhere
keysToRemove.forEach(key => {
  const regex = new RegExp(`^\\s*${key}\\s*:.*$`, 'gm');
  content = content.replace(regex, '');
});

fs.writeFileSync(filePath, content);
console.log('Removed old simulation translation keys.');
