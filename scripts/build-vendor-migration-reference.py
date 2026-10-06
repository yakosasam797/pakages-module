"""Build the standalone Vendor CRM handoff; this does not modify product source.

Requires Pillow (only for new PNG captures) and markdown2. With no capture input,
rebuilds using image data already embedded in the existing generated HTML.
Example: python scripts/build-vendor-migration-reference.py --captures capture.json
"""
from pathlib import Path
import argparse
import base64
import html
import io
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
if (ROOT / '.vendor-doc-tools').exists():
    sys.path.insert(0, str(ROOT / '.vendor-doc-tools'))
import markdown2

DIR = ROOT / 'docs/modules/vendors'
OUT = DIR / 'vendor-crm-migration-reference.html'
MD = DIR / 'vendor-crm-migration-context.md'
MANIFEST = DIR / 'vendor-crm-migration-screens.json'
DATE = '2026-10-04'

def esc(s):
    return html.escape(str(s or ''), quote=True)

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def encode_image(blob):
    from PIL import Image
    image = Image.open(io.BytesIO(blob)).convert('RGB')
    out = io.BytesIO()
    image.save(out, 'WEBP', quality=90, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode(), image.width, image.height

FAMILIES = {
    'Directory': ('Vendor identity and selection', 'Vendor; navigation and filter state are temporary.', 'Vendor CRUD is session React state. No durable backend is demonstrated.', 'VendorsListPage.tsx; App.tsx', 'Open keeps the exact supplier ID; edit targets that record; delete opens confirmation. Selection is not approval. Region precedes offered services and Status is absent from the directory.'),
    'Vendor creation': ('Supplier registration', 'Vendor identity, roles, primary contact and business context.', 'Current vendor creates/edits are session state; submitting is a mutation.', 'NewVendorPage.tsx; VendorFormModal.tsx; App.tsx', 'Create draft vendor validates identity and required fields. Cancel leaves no new supplier. Contact channels and operating base are distinct from coverage promises.'),
    'Vendor detail': ('Supplier relationship context', 'Vendor plus referenced services, contacts and events.', 'Vendor edits are session state; child records can have different stores.', 'VendorOverview.tsx; VendorRateCardsPage.tsx; VendorFormModal.tsx', 'Header edits the current supplier. Tabs expose ten operational areas. Recent activity View all opens the full event list, not a new record.'),
    'Services': ('Supply discovery', 'Service capability and vendor-service references.', 'Created services and deletion markers use browser storage.', 'ServicesPanel.tsx; data/vendorDirectory.ts', 'Category/search/location narrow offerings. Open service resolves that capability; it does not choose a supplier price automatically.'),
    'Service creation': ('Provider-first offering registration', 'Service and provider connection; reusable options are capability data.', 'Save writes the created-service browser store. Cancel does not create a supplier contract.', 'NewServicePage.tsx; data/vendorDirectory.ts', 'Choose an existing provider, type, name and location, then type-specific capabilities. Prices belong to later vendor-owned tariffs. Transport free text is not the vehicle-capacity engine.'),
    'Service detail': ('Capability and supplier discovery', 'Service; Vendors and Rate cards reference supplier-owned records.', 'View/filter/test inputs are temporary. Media and offering edits have local stores/state.', 'ServicesPanel.tsx; ServiceRateCardsPanel.tsx; ServiceRateCardTable.tsx', 'Rate-card identity opens the exact owner/card. Multiple providers require explicit context for creation. Service Test Rate has confirmed dispatch gaps; use exact card tests as evidence.'),
    'Service editing': ('Offering and media maintenance', 'Service capability/media, not supplier contractual price.', 'Service overrides persist locally where wired; file previews are not confirmed external uploads.', 'NewServicePage.tsx; CreateVendorServicePage.tsx; ServicesPanel.tsx', 'Edit changes capability descriptions/options/media. It must not rewrite accepted Proposal prices or duplicate provider tariffs.'),
    'Activity discovery': ('Experience supplier discovery', 'Activity service/options and provider-card references.', 'Discovery is read state; exact Activity cards use their separate card store.', 'ServicesPanel.tsx; ServiceRateCardsPanel.tsx; ServiceTestRate.tsx', 'Different suppliers can price the same activity differently. Current service Test Rate falls back to lodging inputs; exact Activity card Test Rate is the correct reference.'),
    'Vendor services': ('This supplier’s provided offerings', 'Vendor-service connection; vehicle offerings belong to the vendor.', 'Linked/created service stores are local. Merely opening a row is read-only.', 'ServicesPanel.tsx; data/vendorDirectory.ts', 'Open a service retains vendor context. Vehicle offerings appear for Transport. Rate cards tab must remain reachable from vendor-scoped service details.'),
    'Rate-card discovery': ('Contract discovery', 'Exact vendor-owned card, linked to its offered service.', 'Filters and selection are temporary; tariff values resolve their actual store.', 'VendorRateCardsPage.tsx; rateCard/cards.ts', 'Open the exact card. New/import are separate actions. Type, status and validity filters narrow applicable contracts; a status label alone does not prove validity.'),
    'Rate-card creation': ('Supplier tariff creation', 'Selected vendor + service + one supported template.', 'Create draft writes a new local record immediately; it is not a harmless blank preview.', 'CreateRateCardModal.tsx; App.tsx; rateCard/cards.ts', 'Keep owning provider and offering IDs. Focused Transport creates one of four methods; Activity needs linked options. Disabled Flight/Trip/Cruise remain unavailable.'),
    'Creation and imports': ('Source-data entry', 'Import context or selected vendor tariff list.', 'AnchoredImport only resets file/open state; no parsing or record insertion is wired.', 'AnchoredImport.tsx; CreateRateCardModal.tsx', 'Upload and sample template UI are not evidence of successful import. Do not claim data is stored until the parser/save handler exists.'),
    'Vehicles': ('Reusable fleet capability', 'Vehicle Offering, vendorId and serviceIds; never a rate-row capacity copy.', 'paryatech:vehicle-offerings:v1; validation/storage failure is visible.', 'VehicleOfferingsPanel.tsx; data/vehicleOfferings.ts', 'Add/Edit validate distinct label, category, customer seats and bag limits. Unknown values stay unknown. Save keeps current service link; no reservation is created.'),
    'Fixed Transfer': ('Per-vehicle directional route tariff', 'Vendor-owned privateTransport tariff referencing reusable vehicle IDs.', 'Focused cards use v3 local card store; test inputs are temporary.', 'PrivateTransportWorkspace.tsx; rateCard/privateTransport.ts', 'Route × vehicle price plus only applicable scoped extras. Reverse directions require supplier rows. No passenger multiplier or automatic kilometre charge.'),
    'Local Package': ('Time and kilometre package tariff', 'Vendor-owned privateTransport tariff, data-driven package definitions.', 'Focused cards use v3 local store; tests do not save customer arrangements.', 'PrivateTransportWorkspace.tsx; rateCard/privateTransport.ts', 'Select included hours/km package. Excess applies under the supplier’s both/higher/km/hour rule. Do not add a separate Per Km contract.'),
    'Outstation Per Km': ('Distance-based continuous private hire', 'Vendor-owned tariff, vehicle prices and once-only shared rules.', 'Focused v3 card store; one customer hire remains one requirement downstream.', 'PrivateTransportWorkspace.tsx; rateCard/privateTransport.ts', 'Apply supplier-confirmed pooled/daily minimum, day method, distance basis and driver/day. Daily minimum requires daily usage. Never duplicate the full hire on each itinerary day.'),
    'Daily Hire': ('Retained vehicle day tariff', 'Vendor-owned tariff with daily included usage and carry rules.', 'Focused v3 card store; tests do not create a booking.', 'PrivateTransportWorkspace.tsx; rateCard/privateTransport.ts', 'Days × day price plus excess. Keep per-day usage when carry-forward is false. Each allocated vehicle has its own rates; no Per Km tariff is silently substituted.'),
    'Accommodation': ('Approved room-night worksheet experience', 'Supplier-owned legacy accommodation card, room/meal/season/guest rules.', 'Existing seeded card and UI draft behavior differ from focused family stores; inspect save handler.', 'components/rateCard/RateCardDetailPage.tsx; rateCard/engine.ts', 'Edit matrix and applicable occupancy/guest rules. Exact card Test Rate prices each night using runQuote, with blockers. Seasons belong to accommodation, not transport.'),
    'Activity tariff': ('Supplier experience tariff', 'Vendor-owned activityTariff referencing service-owned options.', 'Activity card store, versions and local snapshots; tests are temporary.', 'ActivityRateWorkspace.tsx; rateCard/activityPricing.ts; rateCard/cards.ts', 'Resolve person/group/unit alternative, eligibility, sessions, capacity and extras. Group fare is not multiplied by all guests. Versions/activation remain attached to this supplier card.'),
    'Markup': ('Agency selling default', 'Outer card markup metadata, separate from supplier tariff.', 'Card-family-specific local save; Owner-only, 0–100%, one decimal.', 'rateCard/RateCardDetailPage.tsx', 'Save updates selling default only; Cancel discards it. Proposal applies once or honors a selling override. Supplier payable does not increase.'),
    'Policies and history': ('Supplier terms and provenance', 'Policy/event/version references attached to the exact card.', 'Local card/policy state and family-specific save/version behavior.', 'rateCard/PoliciesPanel.tsx; ActivityPanel.tsx; RateCardDetailPage.tsx', 'Full policy text adds context beyond a table summary. Attachments are evidence, not automatically applied surcharges. Adding a policy does not book/pay.'),
    'History': ('Supplier event history', 'Vendor/card events, actor, time and available change details.', 'Event edits/removal are local where wired; no external audit backend is established.', 'RecentActivityTimeline.tsx; ActivityPanel.tsx; activityFromEvents.ts', 'View activity must show available details/change context. Missing details are explicit. Keep timeline rail and column dividers distinct; pagination outside table.'),
    'Supporting operations': ('Supplier usage context', 'Referenced package/booking records; separate customer/commercial ownership.', 'Illustrative linked rows and local view state; root accepted snapshots are a distinct integration.', 'PackagesPanel.tsx; PackageDetailPage.tsx; VendorBookingsPanel.tsx; BookingViewModal.tsx', 'Opening a package/booking reads linked context. Supplier confirmation and accepted cost handoff do not happen when the modal opens.'),
    'Finance context': ('Supplier obligations and payment details', 'Vendor bank/account references and finance context; root obligations remain separately governed.', 'Bank accounts use browser storage. Summary/fixture payables are not a posting action.', 'VendorFinancePanel.tsx; src/bookingTransportHandoff.ts', 'Four summary cells only. Edit/add bank account does not pay. Statement reads context. Confirmed accepted/amended hires feed one current obligation downstream.'),
    'Documents': ('Supplier compliance/document work', 'Vendor document/request context.', 'Local document/request state; provider delivery and file verification are not established.', 'VendorDocsPanel.tsx', 'Request/Upload/row actions must retain supplier identity. A request draft or document badge is not proof of delivery/authenticity.'),
    'Tasks': ('Supplier-related work', 'Task assignment/due/status, linked vendor context.', 'Current component state, not durable server task scheduling.', 'TasksPanel.tsx', 'Create/assign/edit/complete is work tracking. Completed task is not confirmed vehicle availability or a paid invoice.'),
    'Communications': ('Supplier contact context', 'Conversation/contact/template context.', 'Current local UI state; no email/WhatsApp delivery provider is established.', 'CommunicationPanel.tsx', 'Compose selects recipient/channel/template and records local content. Do not claim external sends from a sent-looking fixture.'),
    'Visa and unfinished products': ('Current Visa tariff and product boundaries', 'Vendor-owned legacy card; product-specific engine is incomplete.', 'Legacy card/UI state; templates can be visible but disabled.', 'rateCard/RateCardDetailPage.tsx; rateCard/cards.ts; CreateRateCardModal.tsx', 'Current Visa uses accommodation-shaped pricing/test fields and mismatched reference labels. This is an identified defect, not a ready per-applicant engine. Flight/Trip/Cruise are coming soon.'),
    'Utilities': ('Shared workspace controls', 'Workspace/account/module notes, notifications and settings; not supplier tariffs.', 'Root notes persist locally; other utilities have local/demo or coming-later behavior.', 'src/WorkspaceNotes.tsx; UniversalSearch.tsx; pages/account; pages/settings; pages/notifications', 'Search opens exact records. Shared notes differ from local NotesPanel fallback. Account is one scrollable page. Settings stubs are explicitly unfinished.'),
    'Version comparison': ('Version provenance', 'Deployed application build versus reviewed local main.', 'Read-only observation; this documentation does not deploy.', 'Vercel build/status and ServicesPanel.tsx', 'An absent tab on an older deployment is not proof that current source omitted it. Verify commit/assets and deployment permission first.'),
}

CONTROL_RULES = {
    'Cancel': 'Discard/close this form state; inspect the specific handler for any already-created draft.',
    'Create draft': 'Creates and stores a new vendor-owned tariff; this is a mutation.',
    'Create service': 'Validate provider and type-specific identity, then save the offering; no tariff/booking is created.',
    'Create draft vendor': 'Validate supplier identity and save to current vendor session state.',
    'Add rate card': 'Requires an owning provider; opens the template flow in that provider/service context.',
    'New rate card': 'Opens template selection for this vendor; service linkage must be resolved.',
    'Edit rate card': 'Enters this exact tariff edit mode; accepted snapshots must remain unchanged.',
    'Activate rate card': 'Lifecycle mutation gated by applicable validation; was not executed for documentation.',
    'Add vehicle': 'Opens a reusable Vehicle Offering dialog; does not add prices or reserve availability.',
    'Test rate': 'Temporary calculation on a selected contract; check dispatch gaps for service-level entries.',
    'Rate cards': 'Tariff discovery; rows must resolve exact vendor/card identity.',
    'View all': 'Opens the full contextual list, such as supplier activity; not a new event.',
    'Save policy': 'Stores contractual text/document context; does not itself apply a numerical surcharge.',
    'Import file': 'Current placeholder closes and clears the file; no parser/record save exists.',
    'Keep vendor': 'Cancels destructive removal; no supplier is deleted.',
    'Delete vendor': 'Confirmation-dependent supplier removal; not performed in this review.',
    'Keep Activity': 'Cancels removal of this local event.',
    'Save note': 'Root WorkspaceNotes persists a browser-local contextual note.',
    'Download rate card': 'Exports selected-card content where wired; does not establish an approved supplier contract.',
}

def context_for(screen):
    family = FAMILIES.get(screen['group'], FAMILIES['Service detail'])
    result = dict(zip(['responsibility', 'owner', 'persistence', 'source', 'actions'], family))
    sources = []
    for token in result['source'].split(';'):
        token = token.strip()
        candidates = [ROOT / token, ROOT / 'src/modules/vendors' / token, ROOT / 'src/modules/vendors/components' / token]
        if token == 'rateCard/RateCardDetailPage.tsx':
            candidates.append(ROOT / 'src/modules/vendors/components/rateCard/RateCardDetailPage.tsx')
        path = next((p for p in candidates if p.exists()), None)
        sources.append(path.relative_to(ROOT).as_posix() if path else token)
    result['source'] = '; '.join(sources)
    return result

def controls_for(screen):
    shell = {'Home', 'All inbox', 'Destination', 'News', 'Queries', 'Packages', 'Customers', 'All finances', 'Team', 'Automations', 'Reports', 'Settings', 'Upgrade', 'Collapse', 'CRM', 'Open universal search', 'Help and support', 'Notifications', 'Account, Vrushabh Jain'}
    controls = []
    for c in screen.get('meta', {}).get('controls', []):
        label = (c.get('label') or '').strip()
        if not label or label in shell or label.startswith(('Copy V-', 'All tasks', 'Collapse sidebar')):
            continue
        row = dict(c)
        row['label'] = label
        if c['tag'] in ('input', 'select', 'textarea'):
            low = label.lower()
            if re.search(r'bag|luggage|suitcase', low):
                row['meaning'] = 'Sized baggage capability in Vehicle Offering, or trip-specific demand in Test Rate. Both size limits and confirmed combined capacity can matter; a blank is unknown.'
            elif re.search(r'passenger|seat|traveller|adult|child|infant|participant|guide', low):
                row['meaning'] = 'Capacity/eligibility or customer requirement according to this screen. Include children and staff seats. Private vehicle/group price must not become a passenger multiplier.'
            elif re.search(r'tax|profile|approval', low):
                row['meaning'] = 'Supplier tax mode/approved profile or approval evidence. Resolve with shared configuration; no hardcoded GST or silently assumed zero tax.'
            elif re.search(r'pickup|drop|route|coverage|operating', low):
                row['meaning'] = 'Applicability and directional service scope. Use the supplier’s actual route/coverage; changing text alone must not select an ineligible tariff.'
            elif re.search(r'valid|date|time|night|start|end|day', low):
                row['meaning'] = 'Contract applicability or customer usage/time input. Evaluate validity, supplier time/day rules and the selected product family; no lodging nights in an Activity/Visa quote.'
            elif re.search(r'price|amount|rate|extra|minimum|included|hour|kilomet| km', low):
                row['meaning'] = 'Supplier tariff/allowance/rule, or temporary usage according to this screen. Keep base, excess and unknown actuals distinct; shared rules must not repeat as every vehicle column.'
            elif re.search(r'markup|margin|percent', low):
                row['meaning'] = 'Agency selling default or decision. Apply once in Proposal; never increase the supplier cost or supplier payable.'
            elif re.search(r'vendor|service|option|template|vehicle', low):
                row['meaning'] = 'Select an existing scoped entity/template. Preserve vendor/service/card/vehicle identities; a connection is a reference, not a copied contract.'
            elif re.search(r'phone|email|whatsapp|contact|recipient', low):
                row['meaning'] = 'Contact identity/channel. Editing or composing is not proof that an external message was sent.'
            else:
                row['meaning'] = 'Input to this screen’s scope. Values/options shown are the captured state; required validation remains in the source.'
        else:
            row['meaning'] = CONTROL_RULES.get(label, 'Visible contextual control. Use the screen action explanation and referenced source to verify its effect; presence alone is not proof of integration.')
        controls.append(row)
    return controls

def render_md(text, prefix):
    body = markdown2.markdown(text, extras=['tables', 'fenced-code-blocks', 'header-ids', 'strike'])
    body = re.sub(r'id="([^"]+)"', lambda m: 'id="' + prefix + '-' + m[1] + '"', body)
    body = re.sub(r'href="#([^"]+)"', lambda m: 'href="#' + prefix + '-' + m[1] + '"', body)
    body = re.sub(r'(<table\b.*?</table>)', r'<div class="table-wrap">\1</div>', body, flags=re.S)
    return body

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--captures', type=Path)
    args = parser.parse_args()
    if args.captures:
        raw = json.loads(args.captures.read_text(encoding='utf-8'))
        screens = []
        for screen in raw:
            image_data, width, height = encode_image(Path(screen.pop('path')).read_bytes())
            screen.update(imageData=image_data, width=width, height=height, reviewed=DATE, evidence='Current browser capture' if screen['group'] != 'Version comparison' else 'Live deployed capture')
            screens.append(screen)
        old = (DIR / 'vendor-crm-context.html').read_text(encoding='utf-8')
        for index, figure in enumerate(re.findall(r'<figure\b[^>]*>(.*?)</figure>', old, re.S)):
            src = re.search(r'<img[^>]+src="(data:image/[^\"]+)"', figure)
            caption = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', figure, re.S)
            if not src:
                continue
            title = html.unescape(re.sub('<[^>]+>', ' ', caption[1] if caption else f'Supplementary screen {index + 1}')).strip()
            image_data, width, height = encode_image(base64.b64decode(src[1].split(',', 1)[1]))
            screens.append(dict(id=f'archive-{index+1:02}', title=title, entry='Earlier visual reference → ' + title, role='Supplementary prior capture; current captures and dated observations take precedence.', notes=['Captured for the earlier 2 October reference. It adds context but does not prove current behavior or override current gaps.'], group='Earlier supporting captures', meta=dict(text='', controls=[], tabs=[], headings=[]), reviewed='2026-10-02', evidence='Earlier supporting capture', imageData=image_data, width=width, height=height))
    else:
        text = OUT.read_text(encoding='utf-8')
        screens = json.loads(re.search(r'<script id="screen-data" type="application/json">(.*?)</script>', text, re.S)[1])

    assert len({s['id'] for s in screens}) == len(screens), 'Duplicate screen identity'
    for screen in screens:
        screen['context'] = context_for(screen)
        if screen['group'] == 'Earlier supporting captures':
            screen['context'] = dict(responsibility='Earlier supplementary evidence', owner='See the current matching screen and complete operations reference.', persistence='Not retested as part of this older capture.', source='vendor-crm-context.html, reviewed 2 October 2026', actions='Use current captures as primary evidence. This image only supplements the finite screen-family inventory.')
        screen['controls'] = controls_for(screen)

    current = [s for s in screens if s['reviewed'] == DATE and s['group'] != 'Version comparison']
    deployed = [s for s in screens if s['group'] == 'Version comparison']
    archive = [s for s in screens if s['group'] == 'Earlier supporting captures']
    groups = list(dict.fromkeys(s['group'] for s in screens))
    inventory = '\n\n## Captured screen inventory\n\n' + f'{len(current)} current local states, {len(deployed)} deployed comparison, {len(archive)} earlier supporting captures; {len(screens)} total images.\n\n'
    inventory += '| Screen | Entry / flow | Responsibility |\n|---|---|---|\n'
    for s in screens:
        inventory += '| [' + s['title'].replace('|', '/') + '](vendor-crm-migration-reference.html#screen-' + s['id'] + ') | ' + s['entry'].replace('|', '/') + ' | ' + s['role'].replace('|', '/') + ' |\n'
    md = MD.read_text(encoding='utf-8')
    md = re.sub(r'<!-- SCREEN_INVENTORY:START -->.*?<!-- SCREEN_INVENTORY:END -->', '<!-- SCREEN_INVENTORY:START -->' + inventory + '<!-- SCREEN_INVENTORY:END -->', md, flags=re.S)
    MD.write_text(md, encoding='utf-8')
    operations = (DIR / 'vendor-module-ux-operational-context.md').read_text(encoding='utf-8')
    prices = (DIR / 'vendor-rate-card-logic-examples-and-test-context.md').read_text(encoding='utf-8')
    text_backup = md + '\n\n---\n\n# Complete earlier module operational context (2 October)\n\nCurrent dated observations above take precedence.\n\n' + operations + '\n\n---\n\n# Complete rate-card examples and persona context (2 October)\n\nCurrent dated observations above take precedence.\n\n' + prices
    (DIR / 'vendor-crm-complete-context.md').write_text(text_backup, encoding='utf-8')
    manifest = dict(reviewed=DATE, sourceCommit='cfc0335998cde94795561b7381bbfe1d6a2c35e9', localScreens=len(current), deployedScreens=len(deployed), earlierScreens=len(archive), totalScreens=len(screens), modelVerification='89 passed; 0 failed; model tests do not establish complete browser journeys', screens=[{k:v for k,v in s.items() if k != 'imageData'} for s in screens])
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

    css = '''
    :root{--ink:#193a3c;--muted:#5a6e70;--brand:#087b72;--paper:#fff;--ground:#edf3f2;--line:#cedcda;--rose:#9a346c;--soft:#f5f8f7;font-family:Segoe UI,Arial,sans-serif;color:var(--ink);background:var(--ground);font-size:15px;line-height:1.55}
    *{box-sizing:border-box}body{margin:0}button,input,select{font:inherit}button,a,input,select{outline-offset:4px}button{cursor:pointer}a{color:var(--brand)}button{color:inherit}h1,h2,h3,h4{line-height:1.2}h1{font-size:38px;letter-spacing:-1.2px;margin:16px 0}h2{font-size:27px;margin:30px 0 18px}h3{font-size:20px}p{max-width:88ch}small,.muted{color:var(--muted)}.skip{position:absolute;left:10px;top:-60px;z-index:20;background:#fff;padding:12px}.skip:focus{top:8px}.layout{display:grid;grid-template-columns:280px minmax(0,1fr)}aside{height:100vh;position:sticky;top:0;background:#fff;border-right:1px solid var(--line);display:flex;flex-direction:column;padding:25px 18px 12px}.wordmark{font-size:24px;font-weight:700;margin-bottom:3px}.sub{color:var(--muted);font-size:13px}.tools{display:flex;gap:7px;flex-wrap:wrap;margin:20px 0}.tools button,.pill,.viewer button{background:#fff;border:1px solid var(--line);border-radius:6px;padding:7px 10px}.tools button.active{background:var(--brand);color:#fff;border-color:var(--brand)}.searchlabel{font-weight:600;font-size:13px}#search{width:100%;padding:10px;margin:8px 0;border:1px solid var(--line);border-radius:6px}#count{font-size:12px;color:var(--muted);margin-bottom:10px}.nav{overflow:auto;flex:1}.nav a{display:block;text-decoration:none;font-size:13px;padding:8px;border-radius:5px;color:var(--ink)}.nav a:hover,.nav a.active{background:#e4f1ed;color:#07534c}.nav h3{font-size:13px;border-top:1px solid var(--line);padding-top:16px}.footer-small{font-size:11px;color:var(--muted);padding-top:12px}.main{min-width:0;padding:32px 38px 70px}.sheet{background:#fff;border:1px solid var(--line);padding:30px;min-width:0;border-radius:9px}.intro{max-width:1050px}.introline{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.introline span{border-left:2px solid var(--line);padding-left:12px;font-size:13px}.introline strong{color:var(--brand)}.lead{font-size:18px;color:var(--muted);max-width:72ch}.boundary{border-left:4px solid var(--rose);padding:12px 18px;background:#fcf6f9;margin:22px 0}.map{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:22px 0}.map button{border:1px solid var(--line);border-radius:7px;padding:17px 12px;text-align:left;background:#f3f8f7}.map button span{display:block;font-size:12px;color:var(--muted);margin-top:7px}.journey{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:15px 0;border-bottom:1px solid var(--line)}.journey a{font-weight:600}.flowlist{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}.flow{padding:15px;border:1px solid var(--line);border-radius:7px}.flow h3{margin:0 0 10px}.flow p{margin:0}.screens-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.screen-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px;display:block;color:var(--ink);text-decoration:none}.screen-card img{width:100%;height:auto;border:1px solid var(--line);display:block}.screen-card h3{font-size:17px;margin-bottom:7px}.screen-card p{font-size:13px;margin-bottom:0}.screen-head{display:flex;align-items:flex-start;gap:15px;justify-content:space-between}.screen-head h1{font-size:30px;margin-top:12px}.path{color:var(--muted);font-size:14px}.badge{display:inline-block;background:#e7f3ef;color:#135749;padding:4px 9px;border-radius:4px;font-size:12px}.badge.archive{background:#f9efdf;color:#70430c}.shot{padding:0;display:block;width:100%;border:1px solid var(--line);border-radius:5px;background:var(--soft);margin:20px 0}.shot img{width:100%;display:block;height:auto}.explain{display:grid;grid-template-columns:1fr 1fr;gap:24px;border-top:1px solid var(--line);padding-top:20px}.explain h3{margin:0 0 8px;font-size:17px}.explain p{margin:0 0 16px}.explain .full{grid-column:1/-1}.screen-notes{background:#f5f8f7;border:1px solid var(--line);border-radius:6px;padding:12px 18px}.table-wrap{overflow:auto;margin:16px 0}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid var(--line);padding:10px 12px;vertical-align:top;text-align:left}th{background:#f3f7f6}td{overflow-wrap:anywhere}td ul{padding-left:16px;margin:0}.mini{font-size:12px;color:var(--muted)}code{font-family:Consolas,monospace;font-size:.9em;overflow-wrap:anywhere}pre{overflow:auto;background:#eff5f3;border:1px solid var(--line);padding:16px;border-radius:5px;max-width:100%}details{margin:18px 0;border-top:1px solid var(--line);padding-top:16px}summary{cursor:pointer;font-weight:600}ul,ol{padding-left:22px}.doc{max-width:1160px}.doc details>div{padding-top:16px}.viewer{width:95vw;max-width:1700px;max-height:96vh;padding:0;border:1px solid var(--line);border-radius:8px}.viewer::backdrop{background:#133532b8}.viewer header{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;position:sticky;top:0;background:#fff;gap:15px}.viewer img{width:100%;display:block}.pager{display:flex;justify-content:space-between;gap:12px;margin:24px 0}.pager a{max-width:45%;font-size:13px}.gap{margin:16px 0;border-top:1px solid var(--line);padding:18px 0}.gap h3{margin:0 0 10px}.compare{display:grid;grid-template-columns:1fr 1fr;gap:16px}.compare img{width:100%;height:auto;border:1px solid var(--line)}.compare a{text-decoration:none}.doc img{max-width:100%}.document-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}.document-tabs a{background:#eff7f4;padding:9px 13px;border-radius:5px}.hidden,[hidden]{display:none!important}.limit{padding:13px;border:1px solid var(--line);background:#f5f8f7}.print-title{display:none}
    @media(max-width:1150px){.layout{grid-template-columns:240px minmax(0,1fr)}.main{padding:24px 20px}.sheet{padding:22px}.map{grid-template-columns:1fr 1fr}.screens-grid{grid-template-columns:1fr}.explain{grid-template-columns:1fr}.explain .full{grid-column:auto}}
    @media(max-width:720px){.layout{display:block}aside{height:auto;position:relative;border-bottom:1px solid var(--line);padding:18px}.nav{max-height:200px}.main{padding:16px 10px}.sheet{padding:17px}h1{font-size:30px}.screen-head{display:block}.flowlist,.compare{grid-template-columns:1fr}.screen-head h1{font-size:26px}.footer-small{display:none}}
    @media print{aside,.tools,.shot,.viewer,.pager{display:none!important}.layout{display:block}.main{padding:0}.sheet{border:0}.doc{max-width:none}.print-title{display:block}.boundary{border:1px solid #999}a{color:#000}.table-wrap{overflow:visible}}
    '''

    flows = [
        ('Supplier registration', 'directory', 'Find supplier → Add vendor → roles/contact/location/business → validate → draft vendor → Overview.'),
        ('Offering registration', 'service-vendor-picker', 'Services → Add service → choose provider → type + capability → save → offering with provider connection.'),
        ('Service discovery', 'activity-service-cards', 'Service → Vendors or Rate cards → exact owning vendor/card. Same underlying tariff as the Vendor path.'),
        ('Tariff maintenance', 'vendor-create-card', 'Vendor/service context → supported template → immediate draft creation → numerical edit → validation → lifecycle.'),
        ('Vehicle capabilities', 'vehicle-new', 'Vendor Transport offering → Vehicle offerings → Add/Edit → seats/bags/AC/service links → save reusable ID.'),
        ('Scoped test', 'fixed-test-arrangement', 'Exact card → Test rate → dates/route/travellers/bags → arrangement → base/extras/tax/actuals result; no booking.'),
        ('Approved accommodation', 'accommodation-card', 'Room/meal/season matrix → guest rules → exact per-night test → restrictions → selling markup default.'),
        ('Supplier experience', 'activity-test', 'Activity option → person/group/unit tariff → eligibility/capacity/extras → correct card-level test.'),
        ('Supplier operations', 'vendor-finance', 'Packages/Bookings/Finance/Docs/Tasks/Communications/Activity each answer different operational questions.'),
        ('Accepted handoff', 'vendor-booking-detail', 'Proposal accepted snapshot → Booking supplier confirmation/amendments → one current Finance obligation.'),
    ]
    intro = f'''<section class="sheet intro" id="start"><div class="introline"><strong>Paryatech / Vendor CRM</strong><span>Migration reference</span><span>Reviewed 4 October 2026</span></div><h1>Understand the supply.<br>Then migrate the workflow.</h1><p class="lead">Current UI evidence, connected user journeys and commercial responsibilities in one shareable file. Start with who owns the data; use screenshots to verify what an employee can actually do.</p><p>{len(current)} current local captures · {len(deployed)} deployed comparison · {len(archive)} earlier supporting captures. Every image is embedded. The complete operations and numerical test context are embedded too.</p><div class="boundary"><strong>Evidence is labelled.</strong> Current UI, model logic, unfinished actions and expected operational behavior are kept distinct. 89 model tests passed; the current service-level test screens still have documented calculator-selection gaps.</div><h2>One supply graph, two discovery paths</h2><div class="journey"><a href="#screen-directory">Vendors</a><span>→</span><a href="#screen-vendor-services">Vendor offerings</a><span>→</span><a href="#screen-vendor-rate-cards">Vendor-owned tariffs</a><span>→</span><a href="#screen-fixed-card">Exact card</a></div><div class="journey"><a href="#screen-services-directory">Services</a><span>→</span><a href="#screen-activity-service-vendors">Providers</a><span>→</span><a href="#screen-activity-service-cards">Their rate cards</a><span>→</span><a href="#screen-activity-card">Same owned record</a></div><div class="map"><button data-group="Vendor detail">Vendor<span>Identity, roles, contacts and supplier relationship</span></button><button data-group="Service detail">Service<span>Discoverable capability and provider connections</span></button><button data-group="Vehicles">Vehicle Offering<span>Reusable seats, luggage, model and AC</span></button><button data-group="Rate-card discovery">Rate Card<span>Supplier tariff, applicability and terms</span></button></div><h2>Follow the work</h2><div class="flowlist">''' + ''.join(f'<article class="flow"><h3><a href="#screen-{id}">{esc(title)}</a></h3><p>{esc(detail)}</p></article>' for title,id,detail in flows) + '''</div><h2>Before reproducing a screen</h2><ol><li>Match the same vendor, service, card ID, permission and date.</li><li>Read its entry, purpose, owner, action destinations and persistence.</li><li>Inspect both normal and empty/validation/disabled states.</li><li>Use the numerical fixtures and personas to verify its behavior.</li><li>Record gaps explicitly; never invent prices, supplier confirmation or delivered messages.</li></ol><p><a href="#context">Read complete updated context</a> · <a href="#gaps">See confirmed reference and deployment gaps</a> · <a href="#group-Fixed-Transfer">Inspect focused transport screens</a></p></section>'''
    gaps = '''<section class="sheet doc" id="gaps"><h1>Confirmed differences and gaps</h1><p>These are findings from the reviewed implementation. The migration should preserve working behavior and resolve an existing defect intentionally, not copy it as the specification.</p><div class="gap"><h3>Deployment difference: Rate cards is missing live</h3><p>The exact South Coast Coaches service page has five tabs locally but four in the deployed build. Latest main deployment was blocked at the status check. This file does not deploy or resolve project access.</p><div class="compare"><a href="#screen-daily-service-overview"><strong>Current local</strong><img data-screen-img="daily-service-overview" alt="Current local service with Rate cards tab"></a><a href="#screen-deployed-service-tabs"><strong>Observed live</strong><img data-screen-img="deployed-service-tabs" alt="Older deployed service missing Rate cards tab"></a></div></div><div class="gap"><h3>Activity service Test Rate uses hotel inputs</h3><p>Munnar Ridge Trek renders nights, room type and meal plans with synthetic prices through ServiceTestRate. The exact activity card uses the experience/person/group/unit engine.</p><div class="compare"><a href="#screen-activity-service-test"><strong>Current service-level gap</strong><img data-screen-img="activity-service-test" alt="Activity service incorrectly displaying stay inputs"></a><a href="#screen-activity-test"><strong>Correct product family</strong><img data-screen-img="activity-test" alt="Activity card showing experience calculation inputs"></a></div></div><div class="gap"><h3>Accommodation service prices are synthetic</h3><p>Fixed room/meal arrays and supplier-type/ID adjustments are not contracted tariff lookup. Compare each exact supplier card with runQuote.</p><a href="#screen-accommodation-service-test">Service comparison</a> · <a href="#screen-accommodation-test">Exact card calculation</a></div><div class="gap"><h3>Transport service tests the first card silently</h3><p>ServicesPanel selects testPriceConnections[0]. It does not establish a staff-selected supplier/card comparison.</p><a href="#screen-transport-service-test">Current service entry</a> · <a href="#screen-fixed-test">Exact selected tariff test</a></div><div class="gap"><h3>Visa still uses lodging-shaped pricing and test inputs</h3><p>Rooms/nights/extra beds are not applicant/processing scope. List and detail reference labels also differ. Published status does not prove a complete Visa workflow.</p><a href="#screen-visa-card">Visa sheet</a> · <a href="#screen-visa-test">Current Visa test</a></div><div class="gap"><h3>Imports and some creation links are incomplete</h3><p>AnchoredImport closes/reset files without parsing or saving. Service selection is required for focused Transport/Activity, but legacy Accommodation/Visa creation does not use an equivalent requirement.</p><a href="#screen-vendors-import">Import placeholder</a> · <a href="#screen-vendor-create-card-templates">Template/service link boundary</a></div><div class="gap"><h3>Local prototype state is not production integration</h3><p>Vendor CRUD is session state; tax profiles and several records are browser-local; support tables contain illustrative rows. Accepted handoff models exist, but every fixture screen is not automatically connected to them.</p><a href="#context">Persistence, downstream handoff and acceptance checklist</a></div></section>'''
    context_html = '<section class="sheet doc" id="context"><div class="document-tabs"><a href="#updated-context">Updated migration context</a><a href="#full-operations">Complete operations backup</a><a href="#full-rates">All rate examples and personas</a></div><article id="updated-context">' + render_md(md, 'updated') + '</article><details id="full-operations"><summary>Complete module operations backup — reviewed 2 October (expand)</summary><div>' + render_md(operations, 'operations') + '</div></details><details id="full-rates"><summary>Complete rate-card logic, catalogue, calculations and personas — reviewed 2 October (expand)</summary><div>' + render_md(prices, 'rates') + '</div></details></section>'
    nav = '<a href="#start">Start / ownership and flows</a><a href="#gaps">Confirmed gaps and comparison</a><a href="#context">Complete context and test backup</a><h3>Current screen groups</h3>' + ''.join('<a href="#group-' + slug(g) + '">' + esc(g) + ' <small>(' + str(sum(s['group'] == g for s in screens)) + ')</small></a>' for g in groups)
    intro = intro.replace('#group-Fixed-Transfer', '#group-fixed-transfer')
    page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Paryatech Vendor CRM — migration reference</title><style>' + css + '</style></head><body><a class="skip" href="#main">Skip to reference</a><div class="layout"><aside><div class="wordmark">Paryatech</div><div class="sub">Vendor CRM · complete handoff</div><div class="tools"><button id="download-text">Download all context</button><button id="download-manifest">Screen inventory</button></div><label class="searchlabel" for="search">Find a screen, field or flow</label><input id="search" type="search" placeholder="e.g. vehicle, margin, night charge"><div id="count"></div><nav class="nav" id="nav" aria-label="Reference navigation">' + nav + '</nav><div class="footer-small">Main baseline cfc0335 · 4 Oct 2026<br>UI evidence + operations + numerical tests<br>No external images, fonts or scripts</div></aside><main class="main" id="main">' + intro + gaps + context_html + '<section id="atlas"></section></main></div><dialog class="viewer" id="viewer" aria-label="Enlarged screenshot"><header><strong id="viewer-title"></strong><button id="viewer-close" type="button">Close ×</button></header><img id="viewer-image" alt=""></dialog>'
    page += '<script id="screen-data" type="application/json">' + json.dumps(screens, ensure_ascii=False, separators=(',', ':')).replace('</', '<\/') + '</script>'
    page += '<script id="text-backup" type="application/json">' + json.dumps(text_backup, ensure_ascii=False).replace('</', '<\/') + '</script>'
    page += '<script id="manifest-data" type="application/json">' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')).replace('</', '<\/') + '</script>'
    script = r'''(()=>{
    const screens=JSON.parse(document.getElementById('screen-data').textContent),byId=new Map(screens.map(s=>[s.id,s]));
    const atlas=document.getElementById('atlas'),start=document.getElementById('start'),gaps=document.getElementById('gaps'),context=document.getElementById('context'),search=document.getElementById('search'),count=document.getElementById('count');
    const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const viewer=document.getElementById('viewer'),viewerImg=document.getElementById('viewer-image');
    const hide=()=>{[start,gaps,context,atlas].forEach(s=>s.hidden=true)};
    const zoom=s=>{viewerImg.src=s.imageData;viewerImg.alt=s.title;document.getElementById('viewer-title').textContent=s.title;viewer.showModal()};
    document.getElementById('viewer-close').onclick=()=>viewer.close();viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});viewer.addEventListener('close',()=>viewerImg.removeAttribute('src'));
    const image=(s)=>`<img src="${s.imageData}" width="${s.width}" height="${s.height}" alt="${escape(s.title)}" loading="lazy" decoding="async">`;
    function gallery(list,title){hide();atlas.hidden=false;atlas.innerHTML=`<h1>${escape(title)}</h1><p class="muted">${list.length} screen states. Open a screen for its entry, ownership, operation, source and control inventory.</p><div class="screens-grid">${list.map(s=>`<a class="screen-card" href="#screen-${s.id}">${image(s)}<h3>${escape(s.title)}</h3><small>${escape(s.evidence)} · ${s.reviewed}</small><p>${escape(s.entry)}</p></a>`).join('')}</div>`}
    function showScreen(s){hide();atlas.hidden=false;const index=screens.indexOf(s),c=s.context;
      const rows=s.controls.map(x=>{const options=x.options?.map(o=>escape(o.text)).join(' / ')||'';return `<tr><td><strong>${escape(x.label)}</strong>${x.disabled?'<br><span class="badge archive">Disabled in this state</span>':''}</td><td>${escape(x.tag)} ${escape(x.type||x.role||'')}<br><small>${escape(x.value??'')}</small>${options?'<br><small>Choices: '+options+'</small>':''}</td><td>${escape(x.meaning)}</td></tr>`}).join('');
      atlas.innerHTML=`<article class="sheet"><header class="screen-head"><div><span class="badge ${s.evidence.includes('Earlier')?'archive':''}">${escape(s.evidence)} · ${s.reviewed}</span><h1>${escape(s.title)}</h1><p class="path">${escape(s.entry)}</p></div><a href="#group-${slug(s.group)}">All ${escape(s.group)} screens</a></header><p>${escape(s.role)}</p><button class="shot" id="zoom-shot" aria-label="Enlarge ${escape(s.title)}">${image(s)}</button><p class="mini">Click to enlarge. ${s.width} × ${s.height}. Screenshot ID: <code>${s.id}</code>. Captured state is evidence, not an availability or approval promise.</p><div class="explain"><div><h3>Data owner and responsibility</h3><p>${escape(c.owner)}</p><h3>Operational role</h3><p>${escape(c.responsibility)}</p></div><div><h3>Persistence / effect</h3><p>${escape(c.persistence)}</p><h3>Source to inspect</h3><p><code>${escape(c.source)}</code></p></div><div class="full"><h3>Actions and destinations</h3><p>${escape(c.actions)}</p></div></div>${s.notes.length?'<div class="screen-notes"><strong>Screen-specific checks and limits</strong><ul>'+s.notes.map(n=>'<li>'+escape(n)+'</li>').join('')+'</ul></div>':''}<h3>Migration checks for this screen</h3><ul><li>Match the exact record and all visible tabs, content sections and action destinations.</li><li>Preserve the owner and scope above; no supplier tariff copies under Services.</li><li>Reproduce required, disabled, blank, error and cancel states from the same controls.</li><li>Verify saving and reopening through both relevant entry paths; do not infer persistence from rendering.</li><li>Use numerical/persona tests for this product family; visible totals alone do not establish correct costing.</li></ul><details><summary>Visible control inventory (${s.controls.length} contextual controls)</summary><p class="mini">Controls are collected from this viewport/state. Other states and lower-page captures cover conditional controls. Global shell controls are described in Utilities.</p><div class="table-wrap"><table><thead><tr><th>Control / field</th><th>Captured kind / value / choices</th><th>Role / operational check</th></tr></thead><tbody>${rows||'<tr><td colspan="3">Earlier supporting capture: consult current matching screen or full source context.</td></tr>'}</tbody></table></div></details><details><summary>Captured tabs and visible page text</summary><p>${escape(s.meta.tabs?.map(t=>t.label+(t.selected==='true'?' [selected]':'')).join(' / '))}</p><pre>${escape(s.meta.text)}</pre></details><nav class="pager">${index>0?'<a href="#screen-'+screens[index-1].id+'">Previous: '+escape(screens[index-1].title)+'</a>':'<span></span>'}${index<screens.length-1?'<a href="#screen-'+screens[index+1].id+'">Next: '+escape(screens[index+1].title)+'</a>':''}</nav></article>`;
      document.getElementById('zoom-shot').onclick=()=>zoom(s);
    }
    function route(){const hash=decodeURIComponent(location.hash.slice(1));document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+hash));
      if(hash.startsWith('screen-')){const s=byId.get(hash.slice(7));if(s)showScreen(s);else gallery([], 'Screen not found')}
      else if(hash.startsWith('group-')){const name=screens.find(s=>slug(s.group)===hash.slice(6))?.group;gallery(screens.filter(s=>s.group===name),name||'Screen group')}
      else if(hash==='gaps'){hide();gaps.hidden=false;gaps.querySelectorAll('[data-screen-img]').forEach(im=>{im.src=byId.get(im.dataset.screenImg).imageData;im.loading='lazy'})}
      else if(hash==='context'||hash==='full-rates'||hash==='full-operations'||hash==='updated-context'||/^(updated|rates|operations)-/.test(hash)){hide();context.hidden=false;const target=document.getElementById(hash);if(target){const d=target.closest('details');if(d)d.open=true;setTimeout(()=>target.scrollIntoView({block:'start'}),0)}}
      else if(hash==='search'){runSearch()}
      else{hide();start.hidden=false}
      if(!(/^(updated|rates|operations)-/.test(hash)||['full-rates','full-operations','updated-context'].includes(hash)))window.scrollTo(0,0);
    }
    function runSearch(){const q=search.value.trim().toLowerCase();const list=screens.filter(s=>[s.id,s.title,s.group,s.entry,s.role,...s.notes,...s.controls.map(x=>x.label)].join(' ').toLowerCase().includes(q));count.textContent=q?`${list.length} matching screens`:`${screens.length} embedded screens`;gallery(list,q?'Search: '+search.value:'All screens')}
    search.addEventListener('input',()=>{if(location.hash!=='#search')history.replaceState(null,'','#search');runSearch()});
    document.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>location.hash='group-'+slug(b.dataset.group));
    function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
    document.getElementById('download-text').onclick=()=>download('vendor-crm-complete-context.md',JSON.parse(document.getElementById('text-backup').textContent),'text/markdown;charset=utf-8');
    document.getElementById('download-manifest').onclick=()=>download('vendor-crm-migration-screens.json',document.getElementById('manifest-data').textContent,'application/json');
    count.textContent=`${screens.length} embedded screens`;window.addEventListener('hashchange',route);route();
    })();'''
    page += '<script id="reference-script">' + script + '</script></body></html>'
    OUT.write_text(page, encoding='utf-8')
    verify(OUT, screens)
    print(json.dumps(dict(html=str(OUT), total=len(screens), local=len(current), deployed=len(deployed), earlier=len(archive), htmlBytes=OUT.stat().st_size, manifestBytes=MANIFEST.stat().st_size)))

def verify(path, screens):
    text=path.read_text(encoding='utf-8')
    static_ids=re.findall(r'\bid="([^\"]+)"', text.split('<script id="screen-data"')[0])
    assert len(static_ids)==len(set(static_ids)), 'Duplicate document anchor'
    known=set(static_ids)|{'search'}|{'screen-'+s['id'] for s in screens}|{'group-'+slug(s['group']) for s in screens}
    for target in re.findall(r'href="#([^\"]+)"', text.split('<script id="screen-data"')[0]):
        # Earlier Markdown generated header ids occasionally differ from hand-written TOCs.
        assert target in known, 'Unresolved anchor: '+target
    assert len(re.findall(r'"imageData":"data:image/webp;base64,', text))==len(screens)
    assert 'https://fonts.' not in text and '<script src=' not in text
    script=re.search(r'<script id="reference-script">(.*?)</script>',text,re.S)[1]
    check=ROOT/'.vendor-reference-script.check.cjs'
    check.write_text(script,encoding='utf-8')
    try:
        subprocess.run(['node','--check',str(check)],check=True,capture_output=True,text=True)
    finally:
        check.unlink(missing_ok=True)

if __name__ == '__main__':
    main()
