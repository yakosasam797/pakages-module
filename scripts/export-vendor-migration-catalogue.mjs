/** Export exact evaluated UI fixture records, not a reconstructed dummy catalogue. */
import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(root, 'docs/modules/vendors');
const server = await createServer({ root, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true }, appType: 'custom' });
try {
  const vendors = await server.ssrLoadModule('/src/modules/vendors/data/vendors.ts');
  const directory = await server.ssrLoadModule('/src/modules/vendors/data/vendorDirectory.ts');
  const services = await server.ssrLoadModule('/src/modules/vendors/data/services.ts');
  const cards = await server.ssrLoadModule('/src/modules/vendors/rateCard/cards.ts');
  const vehicles = await server.ssrLoadModule('/src/modules/vendors/data/privateTransportFixtures.ts');
  const connections = await server.ssrLoadModule('/src/modules/vendors/data/serviceRateCards.ts');
  const types = await server.ssrLoadModule('/src/modules/vendors/rateCard/types.ts');
  const listRows = await server.ssrLoadModule('/src/modules/vendors/data/rateCards.ts');
  const tax = await server.ssrLoadModule('/src/modules/vendors/rateCard/supplierTax.ts');
  const sourceFiles = ['data/vendors.ts','data/vendorDirectory.ts','data/services.ts','data/privateTransportFixtures.ts','data/activityRateFixtures.ts','data/supplierRateFixtures.ts','data/serviceRateCards.ts','data/rateCards.ts','rateCard/cards.ts','rateCard/types.ts','rateCard/privateTransport.ts','rateCard/activityPricing.ts','rateCard/engine.ts','rateCard/supplierTax.ts'];
  const sourceHashes = {};
  for (const file of sourceFiles) sourceHashes[`src/modules/vendors/${file}`] = createHash('sha256').update(await readFile(path.join(root,'src/modules/vendors',file))).digest('hex');
  const rawCards = cards.listDetailCards().map(card=>cards.getDetailCard(card.id) ?? card);
  const resolvedConnections = directory.DIRECTORY_SERVICES.flatMap(service=>connections.serviceRateCardConnections(service.id, directory.VENDOR_SERVICE_CONNECTIONS.filter(item=>item.serviceId===service.id)));
  const ownership = rawCards.map(card=>{
    const embedded = card.privateTransport ?? card.activityTariff;
    const refs = resolvedConnections.filter(connection=>connection.rateCardId===card.id);
    const exactOwner = embedded?.vendorId ?? card.vendorId ?? '';
    const candidates = [...new Set(refs.map(item=>item.vendorId))];
    const named = vendors.SEED_VENDORS.filter(v=>v.name===card.vendor).map(v=>v.id);
    const ownerId = exactOwner || (candidates.length===1?candidates[0]:'') || (named.length===1?named[0]:'');
    return { cardId:card.id, vendorId:ownerId||null, resolution:exactOwner?'stored owner':candidates.length===1?'single discovery owner':named.length===1?'exact supplier name':'unresolved', linkedServiceIds:[...new Set([embedded?.serviceId,card.serviceId,...refs.map(c=>c.serviceId)].filter(Boolean))], connectionIds:refs.map(c=>c.id), family:card.privateTransport?'private-transport':card.activityTariff?'activity':card.regionalTransport?'legacy-regional-transport':card.transport?'legacy-airport-transfer':card.service==='Visa'?'legacy-visa':'legacy-accommodation', template:card.privateTransport?.template ?? card.activityTariff?.enabledMethods ?? card.templateId ?? null };
  });
  const renderedVendorServices = vendors.SEED_VENDORS.flatMap(vendor=>{
    const existing = services.servicesForVendor(vendor.id);
    const linked = directory.VENDOR_SERVICE_CONNECTIONS.filter(c=>c.vendorId===vendor.id && c.id.startsWith('linked-')).flatMap(connection=>{
      const service = directory.DIRECTORY_SERVICES.find(s=>s.id===connection.serviceId);
      if(!service || existing.some(s=>s.name===service.name)) return [];
      const source = services.servicesForVendor(service.profileVendorId).find(s=>s.name===service.name);
      if(source) return [{...source,id:`linked-${vendor.id}-${service.id}`,vendorId:vendor.id,rateCardCount:0,rateCards:[],pricingLabel:'Supplier rate card pending'}];
      return [{id:`linked-${vendor.id}-${service.id}`,vendorId:vendor.id,name:service.name,type:service.category==='Activities'?'Activity':service.category,details:service.description??service.name,about:service.description??service.name,location:service.location,inclusions:service.inclusions??[],profile:{category:service.category,duration:service.activityOptions?.[0]?.duration??'Service based',ageSuitability:'See service options',difficulty:'Not applicable',seasonality:'Subject to supplier availability',searchText:service.name,exclusions:service.exclusions??[]},pricingLabel:'Supplier rate card pending',rateCardCount:0,rateCards:[],imageUrl:'',imageAlt:service.name,media:[]}];
    });
    return [...existing,...linked];
  });
  const vendorRateCardRows = vendors.SEED_VENDORS.flatMap(vendor=>{
    const map = new Map();
    for(const connection of directory.VENDOR_SERVICE_CONNECTIONS.filter(c=>c.vendorId===vendor.id && c.rateCardId)){
      const card = listRows.RATE_CARDS.find(c=>c.id===connection.rateCardId);
      if(!card) continue;
      const current = map.get(card.id);
      if(current){if(!current.serviceIds.includes(connection.serviceId))current.serviceIds.push(connection.serviceId);}
      else map.set(card.id,{id:card.id,vendorId:vendor.id,title:connection.rateCardName,listRecord:card,serviceIds:[connection.serviceId]});
    }
    return [...map.values()];
  });
  const data = {
    schema:'paryatech.vendor-crm.exact-catalogue.v1', exportedAt:new Date().toISOString(), source:'Evaluated main-repository fixture modules; no new suppliers or tariffs invented.', provenance:{sourceHashes, browserOverrides:'Reviewed browser contained empty created/deleted service lists and no matching tariff/vehicle/tax overrides; session vendor mutations are not exported.'},
    instructions:{preserve:['Every record ID, name, reference, owner and relationship','All numerical matrices, nullable amounts, capacities, dates, policies, charge treatments and lifecycle','Service browsing references vendor-owned records; no rate card copies','Legacy/unfinished records remain labelled as such'], doNot:['Invent replacement vendors/services/rates','Use a sample subset as migration completion','Make unresolved rates active or replace null by zero','Silently repair an identity conflict; record it and preserve source provenance']},
    vendors:vendors.SEED_VENDORS, directoryServices:directory.DIRECTORY_SERVICES, vendorServiceProfiles:services.VENDOR_SERVICES,
    vendorServiceConnections:directory.VENDOR_SERVICE_CONNECTIONS, serviceDiscoveryConnections:resolvedConnections,
    vehicleOfferings:vehicles.VEHICLE_OFFERINGS, rateCards:rawCards, rateCardListRows:listRows.RATE_CARDS, ownership,
    renderedVendorServices, vendorRateCardRows,
    supplierTaxProfiles:tax.readSupplierTaxProfiles(),
    rateCardTemplates:types.TEMPLATES,
  };
  data.counts=Object.fromEntries(['vendors','directoryServices','vendorServiceProfiles','renderedVendorServices','vendorServiceConnections','serviceDiscoveryConnections','vehicleOfferings','rateCards','rateCardListRows','vendorRateCardRows','rateCardTemplates','supplierTaxProfiles'].map(k=>[k,data[k].length]));
  data.identityIssues=[];
  for(const k of ['vendors','directoryServices','vendorServiceProfiles','vehicleOfferings','rateCards']){
    const seen=new Set();for(const r of data[k]){if(seen.has(r.id))data.identityIssues.push({kind:'duplicate ID',collection:k,id:r.id});seen.add(r.id);}
  }
  for(const item of ownership){if(!item.vendorId)data.identityIssues.push({kind:'unresolved card owner',cardId:item.cardId});}
  const vendorIds=new Set(data.vendors.map(v=>v.id)),serviceIds=new Set(data.directoryServices.map(v=>v.id)),cardIds=new Set(data.rateCards.map(v=>v.id));
  for(const link of resolvedConnections){if(!vendorIds.has(link.vendorId)||!serviceIds.has(link.serviceId)||link.rateCardId&&!cardIds.has(link.rateCardId))data.identityIssues.push({kind:'dangling discovery reference',connection:link});const own=ownership.find(o=>o.cardId===link.rateCardId);if(own?.vendorId&&own.vendorId!==link.vendorId)data.identityIssues.push({kind:'owner conflict',connection:link,cardOwner:own.vendorId});}
  await mkdir(target,{recursive:true});
  await writeFile(path.join(target,'vendor-crm-exact-catalogue.json'),JSON.stringify(data,null,2)+'\n');
  console.log(JSON.stringify({counts:data.counts,issues:data.identityIssues,unlinkedCards:ownership.filter(o=>!o.linkedServiceIds.length).map(o=>o.cardId)},null,2));
} finally { await server.close(); }
