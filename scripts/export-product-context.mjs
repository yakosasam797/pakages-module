/** Read-only export of the evaluated source fixtures used by the four modules. */
import { createServer } from 'vite';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
const fixtures = source.slice(source.indexOf('const packages:'), source.indexOf('const navIcon'));
if (!fixtures.includes('const proposals:')) throw new Error('Root fixture declarations changed; update exporter.');
const virtualSource = `import { packageDaysForProposal } from '/src/PackageDetail.tsx';
const baliImage='/src/assets/package-images/bali.jpg', dubaiImage='/src/assets/package-images/dubai.jpg', himachalImage='/src/assets/package-images/himachal.jpg', keralaImage='/src/assets/package-images/kerala.jpg', rajasthanImage='/src/assets/package-images/rajasthan.jpg';
${fixtures}
export { packages, proposals };`;
const server = await createServer({ root, configFile: false, appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true },
  plugins: [{ name: 'read-only-context-fixtures', resolveId(id) { if (id === '/context-fixtures.tsx') return '\0context-fixtures.tsx'; }, load(id) { if (id === '\0context-fixtures.tsx') return transformSync(virtualSource, { loader: 'tsx', format: 'esm', jsx: 'automatic' }).code; } }],
});
try {
  const app = await server.ssrLoadModule('/context-fixtures.tsx');
  const finance = await server.ssrLoadModule('/src/modules/finance/financeModel.ts');
  const destinations = await server.ssrLoadModule('/src/destinationDemoData.ts');
  const profiles = await server.ssrLoadModule('/src/destinationProfiles.ts');
  const regions = await server.ssrLoadModule('/src/regionSearch.ts');
  const suppliers = await server.ssrLoadModule('/src/packageServiceSearch.ts');
  const serializable = module => Object.fromEntries(Object.entries(module).filter(([,value]) => typeof value !== 'function'));
  const data = { schemaVersion: 1, evidence: 'Evaluated source fixture baseline; no browser or production database export',
    packages: app.packages, proposals: app.proposals, finance: serializable(finance),
    destinations: serializable(destinations), profiles: serializable(profiles),
    featuredRegions: regions.featuredRegions, supplierServiceOptions: suppliers.crmServiceOptions(),
  };
  const folder = path.join(root, 'docs/modules/agent-reference');
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'product-source-fixtures.json'), JSON.stringify(data, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ packages: data.packages.length, proposals: data.proposals.length,
    obligations: data.finance.OBLIGATIONS.length, transactions: data.finance.TRANSACTIONS.length,
    supplierOptions: data.supplierServiceOptions.length }) + '\n');
} finally { await server.close(); }
