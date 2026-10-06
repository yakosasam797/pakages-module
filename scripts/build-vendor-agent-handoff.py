"""Build a fully static, portable Vendor CRM reference for receiving agents.

Uses existing real UI captures and exact source exports. Standard library only.
No application source, fixtures, storage, or deployment is changed.
"""
from pathlib import Path
from collections import Counter
import base64
import hashlib
import html
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs/modules/vendors'
CATALOGUE = DOCS / 'vendor-crm-exact-catalogue.json'
OUT = DOCS / 'vendor-crm-agent-handoff.html'
TEXT = DOCS / 'vendor-crm-exact-reproduction-context.md'


def esc(value):
    return html.escape(str(value), quote=True)


def pretty(value):
    return json.dumps(value, indent=2, ensure_ascii=False)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def script_json(value):
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')


def table(headers, rows):
    return '<div class="table-wrap"><table><thead><tr>' + ''.join(f'<th>{esc(h)}</th>' for h in headers) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{cell}</td>' for cell in row) + '</tr>' for row in rows) + '</tbody></table></div>'


def build():
    catalogue = json.loads(CATALOGUE.read_text(encoding='utf-8'))
    prior = (DOCS / 'vendor-crm-migration-reference.html').read_text(encoding='utf-8')
    match = re.search(r'<script id="screen-data" type="application/json">(.*?)</script>', prior, re.S)
    screens = json.loads(match.group(1))
    def corrected_prose(value):
        if isinstance(value, str):
            return value.replace('rc-city-fixed', 'rc-cityride-fixed').replace('rc-local-duty', 'rc-local-cabs').replace('trek-munnar', 'munnar-trek')
        if isinstance(value, list):
            return [corrected_prose(v) for v in value]
        if isinstance(value, dict):
            return {k: corrected_prose(v) for k, v in value.items()}
        return value
    for screen in screens:
        for key in ('entry', 'role', 'notes', 'context'):
            screen[key] = corrected_prose(screen[key])
    manifest = [{k: v for k, v in s.items() if k != 'imageData'} for s in screens]
    counts = catalogue['counts']
    evidence = Counter(s['evidence'] for s in screens)
    groups = Counter(s['group'] for s in screens)
    operations = (DOCS / 'vendor-crm-complete-context.md').read_text(encoding='utf-8')
    # Correct shorthand identities in the new embedded prose only. Source JSON is unchanged.
    operations = operations.replace('rc-city-fixed', 'rc-cityride-fixed').replace('rc-local-duty', 'rc-local-cabs').replace('trek-munnar', 'munnar-trek')
    source_paths = [
        'src/modules/vendors/data/vendorDirectory.ts',
        'src/modules/vendors/data/serviceRateCards.ts',
        'src/modules/vendors/data/vehicleOfferings.ts',
        'src/modules/vendors/rateCard/types.ts',
        'src/modules/vendors/rateCard/privateTransport.ts',
        'src/modules/vendors/rateCard/transportOptions.ts',
        'src/modules/vendors/rateCard/activityPricing.ts',
        'src/modules/vendors/rateCard/engine.ts',
        'src/modules/vendors/rateCard/supplierTax.ts',
        'src/modules/vendors/rateCard/privateTransport.personas.test.mjs',
        'src/modules/vendors/rateCard/activityPricing.personas.test.mjs',
        'src/modules/vendors/components/ServiceRateCardTable.tsx',
        'src/modules/vendors/components/ServiceRateCardsPanel.tsx',
        'src/modules/vendors/components/ServiceTestRate.tsx',
        'src/serviceCosting.ts',
        'src/bookingTransportHandoff.ts',
    ]
    sources = [{'path': p, 'sha256': hashlib.sha256((ROOT / p).read_bytes()).hexdigest(), 'text': (ROOT / p).read_bytes().decode('utf-8')} for p in source_paths]
    instructions = f'''# Receiving agent: read and reproduce this reference completely

## Task and authority
Reproduce the current T3 Paryatech Vendor CRM in the target application, using the SAME supplier identities, services, vendor-owned rate cards, vehicle offerings, numerical tariffs, and relationships. A few sample suppliers or a cosmetic pass do not satisfy this task. Do not invent a replacement demo catalogue.
This is a migration reference, not evidence that a target application has already passed tests. The source is the main repository, reviewed 4 October 2026. Export timestamp: {catalogue['exportedAt']}.
The HTML is entirely readable without JavaScript. Every screenshot is a normal image in the static document. All record values, screenshot captions, controls, source page text, operational context, and extraction instructions are present. Opening the first viewport alone is insufficient.

## Mandatory reading procedure
1. Read these instructions and the ownership/identity rules before editing the target.
2. Enumerate the expected counts below, the full catalogue, and the complete screen manifest. Confirm your parser found {len(screens)} screenshot images. Do not paste base64 into model context.
3. Extract this HTML using the embedded Python helper. It needs only Python's standard library. If a filesystem is unavailable, parse catalogue-json and screen-manifest-json in the browser, and navigate the static screen anchors. Do not rely on a text-only HTML fetch to claim that images were inspected.
4. Read operational-context.md completely in manageable chunks. Read every source record JSON, including full price matrices, rules, nullable amounts, ownership, policies, options and versions. Use smaller per-record files rather than truncating one large JSON. Never use only head/first N lines or keyword search as a substitute for full coverage.
5. Inspect the actual screenshot for every current-main capture with an image-capable tool. Read its entry point, context, controls and captured page text. Inspect earlier captures as historical supporting evidence, and record whether current-main evidence supersedes them. Review the deployed comparison as version evidence. Every screen needs a ledger entry.
Read the embedded operational source files as well: relationship resolution, vehicle stores, accommodation/transport/activity pricing engines, supplier tax, exact-card table navigation, service test dispatch, source persona tests, Proposal costing and Booking handoff. These are actual source evidence, not an instruction to copy prototype defects blindly. Persona tests intentionally use confirmed/approved scenario inputs; those modifications are not present in the exported supplier fixtures and must not be imported as genuine approval.
6. Before implementation, produce a gap inventory: source screen ID, target page, absent or wrong element, wrong flow/ownership/calculation, proposed smallest correction, and evidence. Distinguish source prototype defects from missing migration work. Do not redesign the approved shell or simplify away controls.
7. Implement the complete catalogue and all supported flows. Existing target work should be repaired where possible. Keep a one-to-one source identity mapping. Route from service discovery to the precise vendor-owned card, never only to the owner's card list.
8. Inspect target screenshots at corresponding screen sizes and states. Click meaningful actions, test forms/validation/cancel/save, confirm identity on navigation, and exercise pricing cases. Record exact target routes and screenshots in the ledger.
9. Compare all source IDs, values and relationships. Test every listed card with applicable inputs, not only one transport example. Separate tariff math from supplier tax, agency selling price, availability, Booking and Finance.
10. Return the completed record and screen ledgers, test evidence and unresolved gaps. A screen can be marked inspected only after viewing its image; a control can be marked verified only after exercising its handler or proving the source boundary. Missing browser/image access means NOT VERIFIED, not Pass. Do not say migration complete while required entries remain TODO, Fail, Blocked, or undocumented.

## Exact baseline counts
{pretty(counts)}
Screens: {len(screens)} total; evidence breakdown: {pretty(dict(evidence))}.
These counts measure different collections. {counts['directoryServices']} directory services and {counts['renderedVendorServices']} supplier-scoped profile views are not {counts['directoryServices'] + counts['renderedVendorServices']} independent services. {counts['rateCards']} registry records include {counts['rateCardListRows']} listed contracts plus six unlinked historical/blank records. Do not expose those six as new approved focused cards.
No identity issues were found in the evaluated source export. Raw source constants are remapped during module initialization; use the evaluated serviceDiscoveryConnections, not an earlier raw fixture reference.
The source fixture baseline has no approved shared supplier tax profiles. Preserve unresolved tax states; do not insert a 0% profile or approve a supplier merely to manufacture a final payable. Test-only approved scenario profiles in the source tests are separate from the catalogue.

## Data ownership and exact identities
Vendor -> vendor service/offering -> reusable Vehicle Offering -> vendor-owned Rate Card.
Services directory -> vendors providing the service -> relevant vendor-owned Rate Card.
Both entry paths resolve the SAME card ID and owner. No service-owned card copy, duplicate transaction, or new tariff when a row is opened.
Internal ID, displayed reference code, directory service ID, service profile ID, vendor ID and route ID are different namespaces. Preserve each. If the target database assigns its own ID, keep sourceExternalId and an explicit bijective mapping.
Example: rc-cityride-fixed is the internal card ID; its displayed reference may be RC-CITY-FIXED. Do not create rc-city-fixed as a second record. Similarly the local cab card ID is rc-local-cabs, not rc-local-duty.
The catalogue is authoritative for exact fixture identity and stored values. A screenshot is authoritative for that recorded visual state. Current-main captures take precedence over older supporting captures. The recorded live deployment was an older build; its missing Rate cards tab must not override current-main.
vendorRateCardRows gives actual list projections (title, owner, linked services). rateCards gives full detail records. A connection title and detail name may differ in the source; preserve and document this difference instead of silently renaming or copying cards.
renderedVendorServices reproduces ServicesPanel's vendor-scoped projection. It is not permission to create separate independent capabilities for every supplier.

## Required flows and ownership checks
Vendor directory -> Add vendor -> role/identity/contact validation -> current supplier overview.
Vendor -> Services -> offering -> Overview / Vendors / Rate cards / Test rate / Policies. Transport additionally exposes reusable vehicle offering management where applicable.
Services directory -> Add service -> required existing vendor -> type-specific fields -> offering. Provider selection uses the approved dropdown and vendor context.
Service Vendors lists providers; Service Rate cards prioritizes exact card name with vendor identity and region/context. Clicking one opens THAT card under THAT vendor. Add rate card selects an eligible owner when needed; creation never creates a service-owned duplicate.
Vendor Rate cards lists this supplier's contracts, with current approved columns and service/type/status/validity filters. Exact navigation must survive both entry paths and back navigation.
Card -> Rate card / Test rate / Policies / Activity. Create/edit/save/cancel/activation/versioning must follow the family-specific source behavior, with validation retained.
Markup is the saved agency selling default in the outer card. It is displayed at the bottom for supported accommodation, activity and focused transport cards. It does NOT increase supplier cost; Proposal applies it once.
Vehicle Add/Edit saves seats excluding driver, separate luggage allowances, AC and service linkage in Vehicle Offering. Never save passenger count or copy capacity into tariff rows.
Supplier supporting tabs include Packages, Bookings, Finance, Docs, Tasks, Communications and Activity. Preserve their actual controls and navigation. Prototype labels are not proof of delivery, payment or confirmed supply.
Activity tables keep the timeline rail through icons distinct from correctly aligned column boundaries, selections, detail actions and pagination outside the table.
Finance summary uses the four approved first-row KPIs. Bank edit/add and statement controls remain supplier-context operations.

## Pricing and operational invariants
Private chauffeured transport only, with four focused templates: Fixed Transfer, Local Package, Outstation Per Km, Daily Hire. Preserve each contract's selected template; archived regional workbooks are not the approved four-template model.
Transport requirement -> all travellers plus staff seats and luggage -> suitable vehicle allocation (including mixed vehicles) -> eligible supplier -> valid exact vendor-owned card -> base cost -> applicable charges -> shared supplier tax -> supplier payable.
Fixed Transfer: each allocated vehicle quantity x its directional route price. No passenger multiplier, no inferred reverse tariff, no automatic km multiplier.
Local Package: quantity x package price + excess km/hour under the stored both/higher/km/hour rule. Within allowance produces no excess or negative credit.
Outstation: supplier-confirmed pooled or daily minimum, billable-day definition, chargeable distance basis and per-vehicle driver/day. Pooled billable km = max(planned chargeable km, minimum/day x billable days). A continuous hire is charged once even if referenced on multiple itinerary days.
Daily Hire: day charges plus per-day excess when carry-forward is false. Do not pool unused usage without the stored supplier rule. Do not swap to the supplier's per-km card automatically.
Included charges are never added twice. Fixed amounts use the correct vehicle/day/hire scope and trigger. Actual, unknown applicability, missing prices and unresolved mandatory tax remain explicit; never convert them to zero or label a partial result all-inclusive.
Inclusive tax must not be added again; exclusive tax uses an approved shared engine/profile. No invented GST rate or transport-only tax formula. Agency/customer tax remains distinct. Rate validity is not vehicle reservation or supplier confirmation.
Split arrival requirements are separately costed; mixed itinerary requirements independently select their pricing method/card. Proposal changes flag review, accepted values are snapshotted, Booking amendments use only the delta, and Finance receives the resulting obligation once. Test Rate does not create any of those records.
Read the full accommodation, activity and 18 transport persona examples in the operational context. Expected numerical checks include Local MUV 95 km/9 h on 8h/80km: 4200 + 15x25 + 1x400 = 4975; pooled Van 5 days/850km: max(850,5x250)x22 + 5x500 = 30000; daily Van 2 days [140km/9h,180km/12h]: 20000 + 2x500 = 21000. These are pre-tax/other applicable charges under the example contracts, not an instruction to overwrite different stored tariffs.

## Honest reference boundaries
The export is the evaluated main-repository fixture baseline, not a dump of a production database. Reviewed browser has no created/deleted service or tariff/vehicle/tax override; vendor edits may be session state. Browser storage was not modified for this handoff.
Current service-level Activity Test Rate can render accommodation controls; accommodation service tests can use synthetic demo offsets; transport service Test Rate may pick the first supplier connection. Those are recorded gaps, not approved operational logic. Dispatch to the exact applicable card engine and preserve explicit supplier choice when correcting migration logic.
Visa has unfinished hotel-shaped tariff/test fields. Flight/Trip/Cruise are disabled or incomplete. Import UI is not a working parser. Do not invent ready engines or claim an upload imported records.
Screens cover the captured 142 current-main states, one deployed comparison and 51 earlier supporting states. They are not proof that every possible data permutation or absent backend exists. Uncaptured states must be checked against code/behavior and recorded explicitly.
An old test pass, a rendered price or a valid card alone does not establish end-to-end Proposal/Booking/Finance safety. Re-run the relevant source scenarios in the target and disclose unsupported integration.

## Completion evidence
Provide: exact-count comparison; every source ID mapped once; deep comparison of tariff/capacity/charge/tax/null/date/policy/markup fields; ownership and link comparison; current screen/control coverage; test result for each of the 35 listed cards; all 18 transport persona results; accommodation/activity examples; create/edit/cancel and mixed vehicle flows; accepted snapshot/amendment/obligation deduplication checks where implemented; explicit unresolved gaps.
Do not change fixture numbers to make a test pass, invent approved supplier confirmations, remove controls because they appear secondary, or skip a screen because another screen looks similar.
'''
    header = '''# Vendor CRM — exact reproduction context

This is the text handoff for migrating the SAME catalogue and the complete Vendor CRM flows. The companion vendor-crm-agent-handoff.html is self-contained: it includes this baseline, complete operations context and all real UI screenshots. Send both to the receiving agent.

## Reading priority

1. The receiving-agent instructions below.
2. Exact evaluated catalogue and ownership mapping in this file.
3. Current-main screenshots and per-screen context in the HTML.
4. Complete operations reference and numerical examples below.
5. Older supporting screenshots only where they are not superseded.

Earlier handoffs sometimes used shorthand internal IDs. This package corrects those shorthand IDs. Display reference codes must not be confused with internal IDs. Source prototype defects are explicitly recorded; reproducing a known wrong calculator is not the migration acceptance target.

'''
    md = [header, instructions, '\n## Exact vendor and service/card index\n']
    vendors = {v['id']: v for v in catalogue['vendors']}
    services = {s['id']: s for s in catalogue['directoryServices']}
    owners = {o['cardId']: o for o in catalogue['ownership']}
    listed = {r['id'] for r in catalogue['vendorRateCardRows']}
    for vendor in catalogue['vendors']:
        links = [c for c in catalogue['serviceDiscoveryConnections'] if c['vendorId'] == vendor['id']]
        supplier_cards = [c for c in catalogue['rateCards'] if owners[c['id']]['vendorId'] == vendor['id']]
        md.append(f"\n### {vendor['name']} — `{vendor['id']}`\n\n")
        md.append(f"Reference: `{vendor.get('code', '')}`. Roles: {', '.join(vendor.get('roles', []))}. Location: {vendor.get('location', '')}.\n\n")
        md.append('Directory services: ' + '; '.join(f"{services[i]['name']} (`{i}`)" for i in dict.fromkeys(c['serviceId'] for c in links)) + '.\n\n')
        for c in supplier_cards:
            o = owners[c['id']]
            md.append(f"- **{c.get('name', c['id'])}** — `{c['id']}` / `{c.get('ref', '')}`; {o['family']}; service IDs: {', '.join(o['linkedServiceIds']) or 'unlinked'}; {'listed' if c['id'] in listed else 'unlinked historical/blank registry record'}.\n")
        if not supplier_cards:
            md.append('No owned detailed card in the current registry; do not invent one.\n')
    md += ['\n## Full exact evaluated catalogue\n\nEvery field is exported below. Null means unresolved/unset, not zero. Keep the distinction between a directory capability, its vendor profile projection and a supplier tariff.\n\n```json\n', pretty(catalogue), '\n```\n\n## Complete operational context and examples\n\n', operations, '\n## Current operational source evidence\n\nThese are reference implementations and test inputs. Known defects remain documented. Do not treat test-only source confirmation or tax-profile approval as the supplier fixture state.\n']
    for source in sources:
        md += [f"\n### {source['path']}\n\nSource SHA256: `{source['sha256']}`\n\n```typescript\n", source['text'], '\n```\n']
    text_content = ''.join(md)
    TEXT.write_text(text_content.replace('\r\n', '\n'), encoding='utf-8', newline='\n')
    record_hashes = []
    for collection, rows in catalogue.items():
        if not isinstance(rows, list):
            continue
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                continue
            record_hashes.append({'collection': collection, 'id': row.get('id', row.get('cardId', str(i))), 'vendorId': row.get('vendorId', ''), 'sha256': hashlib.sha256(canonical(row).encode('utf-8')).hexdigest()})
    extractor = (ROOT / 'scripts/extract-vendor-agent-handoff.py').read_text(encoding='utf-8')
    css = '''*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:#f4f3f0;color:#182c30;font:16px/1.55 system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:32px}h1{font-size:34px}h2{font-size:26px;margin:36px 0 18px}h3{font-size:20px}a{color:#0b6863}nav{display:flex;gap:16px;flex-wrap:wrap;padding:16px;background:#e4eeeb;border:1px solid #c4d8d2;border-radius:10px}section,article{background:#fff;border:1px solid #d5dcdd;border-radius:10px;padding:24px;margin:22px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 ui-monospace,Consolas,monospace;background:#f5f6f6;padding:18px;border:1px solid #dce1e2;border-radius:6px}img{display:block;width:100%;height:auto;border:1px solid #c8d2d4;margin:18px 0}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:14px}td,th{text-align:left;vertical-align:top;padding:10px;border:1px solid #dce2e3}th{background:#f2f0ed}dt{font-weight:650;margin-top:10px}dd{margin:2px 0 10px}code{overflow-wrap:anywhere}.badge{display:inline-block;padding:4px 9px;border-radius:4px;background:#e8f2ef;color:#185c50;margin-right:6px}.notice{border-left:5px solid #946228;padding:15px;background:#fff5e5}.caption{color:#475f66;font-size:14px}@media(max-width:700px){main{padding:12px}section,article{padding:14px}h1{font-size:27px}}@media print{body{background:white}main{max-width:none}section,article{break-inside:auto}img{break-inside:avoid}nav{position:static}}'''
    parts = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vendor CRM — complete agent migration handoff</title><style>', css, '</style></head><body><main><h1>Vendor CRM: complete agent migration handoff</h1><p>Static, self-contained reference • exact main-repository fixtures • reviewed 4 October 2026</p><nav><a href="#instructions">Read first</a><a href="#ownership">Ownership</a><a href="#catalogue">Exact records</a><a href="#operations">Full operational context</a><a href="#screen-index">All screenshots</a><a href="#extract">Extraction tool</a></nav><p class="notice">Receiving agent: do not stop after the first screen. Read the instructions, extract all records and screenshots, and return completed coverage ledgers. This page does not require JavaScript or a remote image server.</p>']
    parts += ['<section id="instructions"><h2>Receiving-agent instructions</h2><pre id="agent-instructions">', esc(instructions), '</pre></section>']
    parts += ['<section id="ownership"><h2>Ownership and catalogue summary</h2><p><strong>Vendor → offering → vehicle capabilities → vendor-owned tariff.</strong> Service discovery is an alternate path to the same supplier contracts.</p><p>Vehicle seats/luggage live in Vehicle Offering. Supplier tariff lives in Rate Card. Customer trip and selling price live in Proposal. Accepted arrangement lives in Booking. Financial obligations live in Finance.</p>', table(['Collection', 'Exact count'], [[esc(k), esc(v)] for k, v in counts.items()]), '<h3>Supplier index</h3>', table(['Vendor', 'ID', 'Roles', 'Owned listed cards', 'Linked directory services'], [[f'<a href="#record-vendors-{esc(v["id"])}">{esc(v["name"])}</a>', esc(v['id']), esc(', '.join(v.get('roles', []))), esc(sum(r['vendorId'] == v['id'] for r in catalogue['vendorRateCardRows'])), esc(', '.join(dict.fromkeys(services[c['serviceId']]['name'] for c in catalogue['serviceDiscoveryConnections'] if c['vendorId'] == v['id'])))] for v in catalogue['vendors']]), '<h3>Exact card identity and owner</h3>', table(['Card', 'Internal ID', 'Displayed reference', 'Owner', 'Services', 'Family / exposure'], [[f'<a href="#record-rateCards-{esc(c["id"])}">{esc(c.get("name", c["id"]))}</a>', esc(c['id']), esc(c.get('ref', '')), esc(vendors[owners[c['id']]['vendorId']]['name']), esc(', '.join(owners[c['id']]['linkedServiceIds'])), esc(owners[c['id']]['family'] + (' · listed' if c['id'] in listed else ' · unlinked historical/blank'))] for c in catalogue['rateCards']]), '</section>']
    parts += ['<section id="catalogue"><h2>Complete exact catalogue</h2><p>Every exported record appears below in full. These are raw evaluated records, including all matrices, rules, options, charge treatments and nullable fields. No example subset replaces the actual catalogue.</p><pre>', esc(pretty({k: v for k, v in catalogue.items() if not isinstance(v, list)})), '</pre>']
    for collection, rows in catalogue.items():
        if not isinstance(rows, list):
            continue
        parts.append(f'<h3 id="collection-{esc(collection)}">{esc(collection)} — {len(rows)} records</h3>')
        for i, row in enumerate(rows):
            record_id = row.get('id', row.get('cardId', str(i))) if isinstance(row, dict) else str(i)
            name = row.get('name', row.get('title', record_id)) if isinstance(row, dict) else record_id
            parts += [f'<article id="record-{esc(collection)}-{esc(record_id)}" data-collection="{esc(collection)}" data-record-id="{esc(record_id)}"><h3>{esc(name)}</h3><pre>', esc(pretty(row)), '</pre></article>']
    parts.append('</section>')
    parts += ['<section id="operations"><h2>Full logical and operational context</h2><p>Includes the complete module context, known limitations, pricing examples and all transport personas. Exact IDs in the catalogue take precedence over historical prose. This complete text is available to both a browser reader and an HTML parser.</p><pre id="operational-context">', esc(operations), '</pre></section>']
    parts += ['<section id="operational-source"><h2>Current operational source evidence</h2><p>Inspect these implementations for exact calculations, ownership, card navigation and handoff rules. The persona tests include test-only confirmation and approved tax inputs. Those are not the exported fixture state. Known prototype gaps require explicit treatment.</p>']
    for source in sources:
        parts += [f'<article data-source-path="{esc(source["path"])}"><h3>{esc(source["path"])}</h3><p>Source SHA256: {esc(source["sha256"])}</p><pre>', esc(source['text']), '</pre></article>']
    parts.append('</section>')
    parts += ['<section id="screen-index"><h2>All UI evidence: screen index</h2><p>142 current-main states, one deployed-version comparison, and 51 earlier supporting captures. Every image is embedded below in static HTML. Earlier evidence must not override current-main behavior.</p>', table(['Group', 'Screen count'], [[esc(k), esc(v)] for k, v in groups.items()]), table(['Screen ID', 'Screen', 'Evidence', 'Entry path'], [[esc(s['id']), f'<a href="#screen-{esc(s["id"])}">{esc(s["title"])}</a>', esc(s['evidence']), esc(s['entry'])] for s in screens]), '</section>']
    for s in screens:
        assert s['imageData'].startswith('data:image/webp;base64,')
        raw = base64.b64decode(s['imageData'].split(',', 1)[1], validate=True)
        assert raw[:4] == b'RIFF' and raw[8:12] == b'WEBP'
        parts += [f'<section id="screen-{esc(s["id"])}" class="screen" data-screen-id="{esc(s["id"])}"><h2>{esc(s["title"])}</h2><p><span class="badge">{esc(s["id"])}</span><span class="badge">{esc(s["group"])}</span>{esc(s["evidence"])} · {esc(s["reviewed"])}</p>', f'<p><strong>Entry:</strong> {esc(s["entry"])}</p><p><strong>Role:</strong> {esc(s["role"])}</p>', f'<figure><img data-screen-id="{esc(s["id"])}" src="{s["imageData"]}" width="{s["width"]}" height="{s["height"]}" alt="Actual UI screenshot: {esc(s["title"])}" loading="lazy"><figcaption class="caption">Actual captured UI; inspect this image, not just its text. Reference dimensions {s["width"]} × {s["height"]}.</figcaption></figure>']
        parts.append('<dl>' + ''.join(f'<dt>{esc(k)}</dt><dd>{esc(v)}</dd>' for k, v in s['context'].items()) + '</dl>')
        parts.append('<h3>Reference notes and migration obligations</h3><ul>' + ''.join(f'<li>{esc(n)}</li>' for n in s['notes']) + '</ul>')
        parts += ['<h3>Visible controls and their role</h3>', table(['Control', 'Element / type', 'Value / options', 'State', 'Operational meaning'], [[esc(c.get('label', '')), esc(f"{c.get('tag','')} {c.get('role','')} {c.get('type','')}"), esc(pretty({'value': c.get('value'), 'options': c.get('options', [])})), esc('disabled' if c.get('disabled') else 'enabled / source state'), esc(c.get('meaning', 'Inspect handler; do not infer persistence.'))] for c in s['controls']]), '<h3>Complete captured page text</h3><pre>', esc(s['meta'].get('text', '')), '</pre><p><a href="#screen-index">Return to screen index</a></p></section>']
    parts += ['<section id="extract"><h2>Extract for an agent without scanning a giant page</h2><p>Save the following code as <code>extract-vendor-agent-handoff.py</code>, then run:</p><pre>python extract-vendor-agent-handoff.py vendor-crm-agent-handoff.html NEW_OUTPUT_DIRECTORY</pre><p>The output contains READ-FIRST.md, operational-context.md, the exact catalogue, individual record JSON files, individual screenshots and context files, checksums and two TODO coverage ledgers. Read them all in chunks and update the ledgers. The helper refuses to overwrite a nonempty output directory.</p><pre>', esc(extractor), '</pre></section>']
    parts += [f'<script id="catalogue-json" type="application/json">{script_json(catalogue)}</script>', f'<script id="screen-manifest-json" type="application/json">{script_json(manifest)}</script>', f'<script id="record-hashes-json" type="application/json">{script_json(record_hashes)}</script>', f'<script id="operational-source-json" type="application/json">{script_json(sources)}</script>', '</main></body></html>']
    OUT.write_text(''.join(parts).replace('\r\n', '\n'), encoding='utf-8', newline='\n')
    print(json.dumps({'html': str(OUT), 'html_bytes': OUT.stat().st_size, 'text': str(TEXT), 'text_bytes': TEXT.stat().st_size, 'screens': len(screens), 'evidence': dict(evidence), 'records': len(record_hashes), 'counts': counts}, indent=2))


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    build()
