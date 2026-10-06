"""Build static, self-contained Booking/Finance/Destination/Packages references.

Inputs: existing real screenshot atlases, imported T3 captures, reviewed context,
evaluated fixtures, and exact current source. No application source is changed.
Install Markdown/Pillow in TEMP/paryatech-context-tools, or the current Python env.
"""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
from functools import lru_cache
import base64
import hashlib
import html
import io
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, str(Path(os.environ.get('TEMP', '.')) / 'paryatech-context-tools'))
import markdown
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs/modules'
REF = DOCS / 'agent-reference'
MODULES = {
    'bookings': ('booking', 'Booking', 'booking-agent-handoff.html'),
    'finance': ('finance', 'All Finance', 'finance-agent-handoff.html'),
    'destinations': ('destination', 'Destination', 'destination-agent-handoff.html'),
    'packages': ('packages', 'Packages and Proposals', 'packages-proposals-agent-handoff.html'),
}

MAX_HTML_BYTES = 20_000_000
WEBP_QUALITY = 95


@lru_cache(maxsize=512)
def compact_screenshot(raw, quality):
    """Keep the original dimensions; retain existing smaller encodings."""
    with Image.open(io.BytesIO(raw)) as original:
        has_alpha = original.mode in ('RGBA', 'LA') or 'transparency' in original.info
        image = original.convert('RGBA' if has_alpha else 'RGB')
        if image.mode == 'RGBA' and image.getextrema()[3] == (255, 255):
            image = image.convert('RGB')
        buffer = io.BytesIO()
        image.save(buffer, format='WEBP', quality=quality, method=6)
        encoded = buffer.getvalue()
    return encoded if len(encoded) < len(raw) else None

# These real capture files were inspected during image QA. Their unfinished
# paint/animation frames must not be mistaken for empty product screens.
INCOMPLETE_IMAGES = {
    'current-finance-supplier-detail-1': 'Drawer animation had not painted; the next image contains the complete supplier drawer.',
    'current-destination-service-accommodation-1': 'Drawer animation had not painted; the next image contains the accommodation service.',
    'current-destination-activity-detail-1': 'Drawer animation had not painted; the next image contains the activity details.',
    'earlier-finance-customer-detail-1': 'Earlier unfinished drawer; use current-finance-customer-detail instead.',
    'earlier-finance-activity-detail-1': 'Earlier unfinished drawer; use current-finance-activity-detail instead.',
    'earlier-proposal-block-types-1': 'Earlier unfinished modal; use current-proposal-block-types instead.',
    'earlier-proposal-shared-1': 'Earlier unfinished main view; the next earlier image and current shared-customer captures contain the rendered UI.',
}

REMAINING = {
    'bookings': [
        ('accepted-transport', 'Accepted transport panel: initial payable, actuals validation, amendment, pending/reconfirmation and confirmed result', 'src/TransportBookingHandoffPanel.tsx', 'Requires stored accepted snapshots. Clean source baseline contains none; no default UI image.'),
        ('accepted-activity', 'Accepted activity panel: confirmed session versus pending availability', 'src/BookingModule.tsx', 'Conditional on stored approved Activity snapshots, absent from clean baseline.'),
        ('more-overflow', 'Narrow Booking tab overflow / More menu', 'src/modules/bookings/booking-redesign.html', 'Desktop captures show all tabs; this viewport-dependent overflow state was not separately captured.'),
        ('native-pickers', 'Native select options, calendar/file chooser, every filtered table/selection variant', 'src/modules/bookings/booking-redesign.html', 'Fields/options and source handlers are inventoried. Platform UI and all data permutations are not individually photographed.'),
    ],
    'finance': [
        ('transport-obligation-adapter', 'Confirmed transport supplier obligation adapter', 'src/FinanceModule.tsx', 'Requires supplier-confirmed accepted snapshots; absent in clean source baseline. Not merged into FinanceApp totals.'),
        ('record-validation-variants', 'Missing/duplicate external reference, invalid/over-remaining amount, invalid target and date edge states', 'src/modules/finance/FinanceApp.tsx', 'All form modes and source-balance error are pictured; each other guard permutation is source-only.'),
        ('supplier-tax-valid-form', 'Approved supplier-tax form enabled save and saved profile result', 'src/SupplierTaxProfilesPanel.tsx', 'Default blank/disabled form pictured. No test approval was inserted into the shared supplier store.'),
        ('vendor-bank-add', 'Add bank account and alternate optional-bank-field variants', 'src/modules/vendors/components/VendorFinancePanel.tsx', 'Bank edit/current statement are included. Add-form branches are source-inventoried, not separately screenshot verified.'),
        ('standalone-notes', 'Legacy FinanceApp internal notes panel', 'src/modules/finance/FinanceApp.tsx', 'Hidden by root wrapper. It is not the shared Finance notes flow.'),
    ],
    'destinations': [
        ('search-network', 'Search finding-places/loading and API failure', 'src/DestinationPage.tsx', 'Conditional asynchronous/network states. Default local catalog resolves quickly; no API failure was fabricated.'),
        ('booking-load', 'Trips Reading bookings / Booking records could not be loaded', 'src/destinationSources.ts', 'Conditional fetch states; normal prepared Booking HTML was available during capture.'),
        ('dormant-examples', 'Example service/activity/vendor detail variants', 'src/destinationDemoData.ts', 'Current Bali example service/vendor arrays are empty. Source render branches have no default entry.'),
        ('empty-rails-and-end-scroll', 'All-empty destination and far-right positions of every horizontal rail', 'src/DestinationPage.tsx', 'Sparse Bengaluru and all six Bali rail starts pictured; every location/end-scroll permutation is not separately photographed.'),
        ('source-handoff-variants', 'Every source-package/proposal card, vendor-package and Booking module handoff', 'src/DestinationPage.tsx', 'Identity logic is embedded; different record/rail entries are not each a separate screenshot.'),
    ],
    'packages': [
        ('transport-variants', 'Mixed vehicles, split groups, daily usage/retained hires, alternative tariff and payable-at-actuals variants', 'src/PrivateTransportProposalCosting.tsx', 'Four focused method references included from earlier atlas; not every current allocation/usage/actuals permutation photographed.'),
        ('activity-variants', 'Per-unit/time, age/session/capacity, required external services and on-request confirmation branches', 'src/TripComposer.tsx; src/PackageStructuredPricing.tsx', 'Person/private cards and draft activation guard pictured. Remaining enabled-card-specific variants require source/fixture review and new scenario captures.'),
        ('supplier-api', 'Supplier/region API finding/error states', 'src/packageServiceSearch.ts; src/regionSearch.ts', 'No configured external service API was fabricated. Local search/empty results are pictured.'),
        ('photo-upload', 'File selection, six-photo limit and every image removal state', 'src/TripComposer.tsx', 'Place photo controls and source are included. Operating-system chooser and every count not photographed.'),
        ('sharing-validation', 'All date/email/day/price/readiness and supplier-approval rejection combinations', 'src/TripComposer.tsx; src/serviceCosting.ts', 'Required basics, empty itinerary, unresolved rates and publication mismatch pictured; each remaining guard is retained in exact source.'),
        ('unused-package-mode', 'TripComposer package-mode fixed-departure controls', 'src/TripComposer.tsx; src/App.tsx', 'Root PackageBuilder mounts PackageComposer. Do not treat the alternate package mode as a reachable root screen.'),
        ('approval-snapshot-handoff', 'New priced approval with supplier snapshots and resulting Booking panels', 'src/App.tsx; src/serviceCosting.ts', 'Approved fixture and revision history pictured; current clean fixtures do not establish approved supplier snapshot integration.'),
    ],
}


def esc(value):
    return html.escape(str(value), quote=True)


def pretty(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


def script_json(value):
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')


class AtlasParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.images, self.scripts = [], {}
        self.script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and attrs.get('src', '').startswith('data:image/'):
            self.images.append(attrs)
        if tag == 'script' and attrs.get('type') == 'application/json':
            self.script = attrs.get('id')
            self.scripts[self.script] = ''

    def handle_endtag(self, tag):
        if tag == 'script':
            self.script = None

    def handle_data(self, value):
        if self.script:
            self.scripts[self.script] += value


def image_record(key, uri, sequence=1, quality=WEBP_QUALITY):
    raw = base64.b64decode(uri.split(',', 1)[1], validate=True)
    with Image.open(io.BytesIO(raw)) as image:
        width, height = image.size
    original_sha = hashlib.sha256(raw).hexdigest()
    original_bytes = len(raw)
    encoded = compact_screenshot(raw, quality)
    if encoded is not None:
        raw = encoded
        uri = 'data:image/webp;base64,' + base64.b64encode(raw).decode()
    return {'id': key, 'sequence': sequence, 'width': width, 'height': height,
        'sha256': hashlib.sha256(raw).hexdigest(), 'data': uri,
        'originalSha256': original_sha, 'originalBytes': original_bytes, 'encodedBytes': len(raw),
        'encoding': f'WebP quality {quality}; original resolution' if encoded is not None else 'Original encoding retained'}


def prior_screens(module, prefix, quality):
    path = DOCS / module / f'{prefix}-module-ui-context.html'
    parsed = AtlasParser()
    parsed.feed(path.read_text(encoding='utf-8'))
    if 'context-model' in parsed.scripts:
        model = json.loads(parsed.scripts['context-model'])
        images = {image['id']: image['src'] for image in parsed.images if image.get('id')}
        screens = []
        for source in model['screens']:
            key = 'earlier-' + source['id']
            screen = {**source, 'id': key, 'sourceScreenId': source['id'], 'images': [],
                'evidence': 'Earlier real UI capture: ' + str(model.get('capturePeriod', model.get('reviewed', '2–3 October 2026'))),
                'reviewed': model.get('reviewed'), 'captureSource': path.relative_to(ROOT).as_posix()}
            for index, capture in enumerate(source['captures'], 1):
                screen['images'].append(image_record(f'{key}-{index}', images[capture['elementId']], index, quality))
            screens.append(screen)
        return screens
    # Booking's earlier atlas is a static document, not a JS context model.
    screens = []
    for index, image in enumerate(parsed.images, 1):
        title = image.get('alt', f'Booking screenshot {index}').replace(' in the current Booking UI', '')
        key = f'earlier-booking-{index:02}'
        screens.append({'id': key, 'sourceScreenId': key, 'group': 'Earlier Booking reference',
            'title': title, 'entry': title, 'purpose': 'Earlier captured Booking page/dialog; compare with current atlas and source.',
            'behavior': 'Read the full Booking operations context and current dialog effect table before interpreting a visible action.',
            'evidence': 'Earlier real UI capture: 2 October 2026', 'reviewed': '2 October 2026',
            'captureSource': path.relative_to(ROOT).as_posix(), 'inventory': {},
            'images': [image_record(f'{key}-1', image['src'], quality=quality)]})
    return screens


def current_screens(module, all_captures, quality):
    screens = []
    for source in all_captures:
        if source['module'] != module:
            continue
        key = 'current-' + source['id']
        screen = {k: v for k, v in source.items() if k != 'captures'}
        screen.update(id=key, sourceScreenId=source['id'], images=[],
            purpose=source['notes'], behavior=source['notes'], reviewed='5 October 2026')
        if source['id'] in ('booking-modal-editPrice', 'booking-modal-editCost', 'booking-modal-watchers'):
            screen['evidence'] = 'Current source-rendered dialog; handler invoked directly; no live entry found'
        for index, capture in enumerate(source['captures'], 1):
            raw = (ROOT / capture['path']).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == capture['sha256']
            image = image_record(f'{key}-{index}', 'data:image/webp;base64,' + base64.b64encode(raw).decode(), index, quality)
            screen['images'].append(image)
        screens.append(screen)
    return screens


def contextual_finance(all_captures, quality):
    screens = []
    for source in current_screens('bookings', all_captures, quality):
        if not (source['sourceScreenId'] in ['booking-finance', 'booking-finance-row-menu', 'booking-finance-row-detail'] or
                source['sourceScreenId'] in ['booking-modal-' + key for key in ('recordPayment', 'addInstalment', 'editInstalment', 'supplierPay', 'priceAmend', 'manageMargin', 'editPrice', 'editCost')]):
            continue
        source['id'] = 'context-' + source['id']
        source['group'] = 'Booking Finance context'
        for image in source['images']:
            image['id'] = 'context-' + image['id']
        screens.append(source)
    vendor = DOCS / 'vendors/vendor-crm-agent-handoff.html'
    if not vendor.exists():
        raise FileNotFoundError('Vendor Finance screenshots must be available for All Finance.')
    parsed = AtlasParser()
    parsed.feed(vendor.read_text(encoding='utf-8'))
    manifest = json.loads(parsed.scripts['screen-manifest-json'])
    images = {image['data-screen-id']: image['src'] for image in parsed.images if image.get('data-screen-id')}
    for source in manifest:
        if source['group'] != 'Finance context':
            continue
        key = 'context-' + source['id']
        screens.append({'id': key, 'sourceScreenId': source['id'], 'group': 'Vendor Finance context',
            'title': source['title'], 'entry': source['entry'], 'purpose': source['role'],
            'behavior': '\n'.join(source.get('notes', [])), 'context': source.get('context', {}),
            'inventory': {'controls': source.get('controls', []), 'text': source.get('meta', {}).get('text', '')},
            'pageText': source.get('meta', {}).get('text', ''), 'evidence': source['evidence'] + ' from Vendor reference',
            'reviewed': source.get('reviewed'), 'images': [image_record(key + '-1', images[source['id']], quality=quality)]})
    return screens


def source_paths(module):
    common = ['src/App.tsx', 'src/App.css', 'src/WorkspaceNotes.tsx', 'src/WorkspaceNotes.css',
        'src/useStepNavigation.ts', 'src/embeddedModuleFrame.ts', 'src/destinationNavigation.ts',
        'package.json', 'vite.config.ts', 'scripts/prepare-assets.mjs']
    root_names = {
        'bookings': ['BookingModule.tsx', 'TransportBookingHandoffPanel.tsx', 'bookingTransportHandoff.ts', 'bookingActivityHandoff.ts', 'proposalModel.ts'],
        'finance': ['FinanceModule.tsx', 'SupplierTaxProfilesPanel.tsx', 'bookingTransportHandoff.ts', 'TransportBookingHandoffPanel.tsx', 'BookingModule.tsx', 'proposalModel.ts'],
        'destinations': ['DestinationPage.tsx', 'DestinationPage.css', 'destinationSources.ts', 'destinationDemoData.ts', 'destinationProfiles.ts', 'regionSearch.ts', 'PackageDetail.tsx', 'proposalModel.ts'],
        'packages': ['PackageBuilder.tsx', 'PackageComposer.tsx', 'PackageComposer.css', 'PackagePricing.tsx', 'PackagePricing.css', 'PackageStructuredPricing.tsx', 'TripComposer.tsx', 'TripComposer.css', 'ProposalBuilder.tsx', 'ProposalDetail.tsx', 'ProposalDetail.css', 'PackageDetail.tsx', 'PackageDetail.css', 'packageServiceSearch.ts', 'proposalModel.ts', 'serviceCosting.ts', 'PrivateTransportProposalCosting.tsx', 'PrivateTransportProposalCosting.css', 'bookingTransportHandoff.ts', 'bookingActivityHandoff.ts', 'regionSearch.ts'],
    }
    paths = common + ['src/' + file for file in root_names[module]]
    if module in ('bookings', 'finance', 'destinations'):
        paths.append('src/modules/bookings/booking-redesign.html')
    if module == 'finance':
        paths += [p.relative_to(ROOT).as_posix() for p in (ROOT / 'src/modules/finance').glob('*') if p.is_file()]
        paths += ['src/modules/vendors/components/VendorFinancePanel.tsx', 'src/modules/vendors/components/VendorFinancePanel.css', 'src/modules/vendors/data/vendorFinance.ts']
    if module in ('packages', 'destinations', 'finance', 'bookings'):
        paths += [p.relative_to(ROOT).as_posix() for p in (ROOT / 'src/modules/vendors/data').glob('*.ts')]
        paths += [p.relative_to(ROOT).as_posix() for p in (ROOT / 'src/modules/vendors/rateCard').glob('*') if p.suffix in ('.ts', '.mjs')]
    if module in ('bookings', 'finance', 'packages'):
        paths += ['scripts/transport-handoff.test.mjs', 'scripts/finance-fixture.test.mjs']
    return sorted(set(p for p in paths if (ROOT / p).exists()))


def source_records(module):
    records = []
    for path in source_paths(module):
        raw = (ROOT / path).read_bytes()
        records.append({'path': path, 'sha256': hashlib.sha256(raw).hexdigest(),
            'bytesBase64': base64.b64encode(raw).decode(), 'text': raw.decode('utf-8')})
    return records


class BookingInventory(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.dialogs, self.fields, self.entries = [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id', '').startswith('modal-'):
            self.dialogs.append(attrs['id'])
        if tag in ('input', 'textarea', 'select'):
            self.fields.append({'tag': tag, **attrs})
        if 'data-open-modal' in attrs:
            self.entries.append({'tag': tag, **attrs})


def coverage(module, sources, screens):
    # Exact line references and full source accompany these candidate markers.
    # This is deliberately not presented as a reachability proof/AST oracle.
    markers = []
    for source in sources:
        if not source['path'].endswith(('.tsx', '.ts', '.html')):
            continue
        lines = []
        for number, line in enumerate(source['text'].splitlines(), 1):
            if any(token in line for token in ('useState', '<Modal', '<NotesDrawer', 'role="dialog"', 'setError(', 'role="menu"', 'type="file"', 'data-open-modal=', 'function handleSubmit')):
                cleaned = re.sub(r'data:image/[^\s"\']+', '[embedded source image]', line)
                lines.append({'line': number, 'text': cleaned})
        if lines:
            markers.append({'path': source['path'], 'markers': lines})
    remaining = [{'id': key, 'description': description, 'source': source, 'reason': reason,
        'status': 'NOT SCREENSHOT VERIFIED'} for key, description, source, reason in REMAINING[module]]
    data = {'scope': 'Meaningful source-supported module states; current and earlier real UI evidence, with explicit remaining conditions',
        'reviewed': '5 October 2026', 'currentStates': sum(s['id'].startswith('current-') for s in screens),
        'earlierStates': sum(s['id'].startswith('earlier-') for s in screens),
        'contextualStates': sum(s['id'].startswith('context-') for s in screens),
        'stateCount': len(screens), 'imageCount': sum(len(s['images']) for s in screens),
        'remainingStates': remaining, 'sourceMarkers': markers,
        'markerLimit': 'Marker search identifies review candidates, not every semantic branch. The complete source bytes are embedded; receiving agent must enumerate all branches before implementation.'}
    if module in ('bookings', 'finance'):
        inventory = BookingInventory()
        inventory.feed((ROOT / 'src/modules/bookings/booking-redesign.html').read_text(encoding='utf-8'))
        data['bookingSourceInventory'] = {'namedDialogs': inventory.dialogs, 'fields': inventory.fields,
            'entryAttributes': inventory.entries, 'generatedDialog': 'booking-row-detail'}
        if module == 'bookings':
            captured = {s['sourceScreenId'].replace('booking-modal-', 'modal-') for s in screens if s['id'].startswith('current-booking-modal-')}
            assert set(inventory.dialogs) == captured, 'Named Booking modal coverage mismatch'
    return data


def baseline(module, data, vendor):
    common = {'evidence': data['evidence'], 'sourceScope': 'Evaluated source fixtures; do not confuse current screenshot scenario state with this baseline'}
    if module == 'finance':
        return {**common, 'agencyFinance': data['finance'], 'sharedSupplierTaxProfiles': vendor['supplierTaxProfiles'],
            'contextualSource': 'Booking Finance and Vendor Finance fixtures are separately embedded in exact source. They are not reconciled to agency records.'}
    if module == 'bookings':
        parser = BookingInventory()
        parser.feed((ROOT / 'src/modules/bookings/booking-redesign.html').read_text(encoding='utf-8'))
        return {**common, 'rootProposals': data['proposals'], 'namedDialogs': parser.dialogs,
            'bookingSource': 'Exact seven directory rows and nine-panel Dubai detail are in the embedded Booking HTML source.'}
    if module == 'destinations':
        return {**common, 'packages': data['packages'], 'proposals': data['proposals'], 'examples': data['destinations'],
            'profiles': data['profiles'], 'featuredRegions': data['featuredRegions'],
            'vendors': vendor['vendors'], 'directoryServices': vendor['directoryServices'],
            'vendorServiceProfiles': vendor['vendorServiceProfiles'], 'connections': vendor['vendorServiceConnections']}
    return {**common, 'packages': data['packages'], 'proposals': data['proposals'],
        'supplierServiceOptions': data['supplierServiceOptions'],
        'supplierDependencies': {key: vendor[key] for key in ['vendors', 'directoryServices', 'vendorServiceConnections', 'serviceDiscoveryConnections', 'vehicleOfferings', 'rateCards', 'ownership', 'supplierTaxProfiles']}}


CSS = '''
:root{color-scheme:light;--ink:#183244;--paper:#fff;--wash:#eff4f7;--line:#d5e0e5;--work:#0d776d;--gap:#795000}
*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 'Segoe UI',Arial,sans-serif}a{color:var(--work);text-underline-offset:3px}a:hover{text-decoration-thickness:2px}button,input{font:inherit}a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid var(--work);outline-offset:4px}
.side{position:fixed;inset:0 auto 0 0;width:238px;padding:28px 22px;background:var(--wash);border-right:1px solid var(--line);overflow:auto}.side strong{font-family:Bahnschrift,'Segoe UI',sans-serif;font-size:23px;display:block;line-height:1.25;margin-bottom:18px}.side a{display:block;padding:7px 0}.side p{font-size:13px;line-height:1.5}.side input{width:100%;padding:9px;border:1px solid #92a9b4;background:white;border-radius:4px}
main{margin-left:238px;padding:44px 44px 90px;max-width:1440px}.hero{border-left:6px solid var(--work);padding-left:24px;margin:0 0 40px}.hero h1{font-family:Bahnschrift,'Segoe UI',sans-serif;font-size:clamp(30px,4vw,49px);font-weight:650;line-height:1.15;max-width:23ch;margin:0 0 16px}.hero p{max-width:72ch}h2{font-family:Bahnschrift,'Segoe UI',sans-serif;font-size:28px;line-height:1.3;margin:0 0 20px}h3{font-size:20px;line-height:1.4;margin:28px 0 12px}.section{margin-bottom:54px;scroll-margin-top:18px}.prose{max-width:80ch}.prose p,.prose li{max-width:78ch}.prose h2{margin-top:40px}.prose ul,.prose ol{padding-left:25px}.badge{display:inline-block;padding:3px 9px;margin:0 6px 5px 0;border:1px solid var(--line);border-radius:4px;font-size:13px}.gap{padding:16px 20px;border-left:4px solid var(--gap);background:#fff7e8;max-width:85ch}.facts{display:flex;gap:22px;flex-wrap:wrap;margin:22px 0}.facts span{font-size:14px}.facts b{font-size:24px;display:block}.table-wrap{overflow:auto;margin:16px 0}table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.5}th{text-align:left;background:var(--wash);font-weight:650}td,th{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}tr:first-child th{border-top:1px solid var(--line)}code,pre{font-family:Consolas,'Courier New',monospace}code{font-size:.88em;background:var(--wash);padding:1px 4px}pre{font-size:13px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;background:var(--wash);border:1px solid var(--line);padding:18px;max-height:650px;overflow:auto}details{margin:15px 0}summary{cursor:pointer;font-weight:600;padding:8px 0}.screen{padding:30px 0 40px;border-top:2px solid var(--line);scroll-margin-top:16px}.screen h2{margin-bottom:10px}.screen p{max-width:85ch}.screen figure{margin:22px 0}.screen img{display:block;width:100%;height:auto;max-width:1440px;border:1px solid var(--line);background:var(--wash);cursor:zoom-in}.screen figcaption{font-size:13px;padding-top:8px}.control-list{font-size:14px}.context-links{display:flex;gap:16px;flex-wrap:wrap}.source-list{max-width:100%}.source-list summary{font-family:Consolas,monospace;font-size:13px}.hidden-text{display:none}.reading-rule{font-weight:600}.viewer{width:min(98vw,1600px);height:96vh;max-width:none;max-height:none;padding:0;border:1px solid var(--line);overflow:auto}.viewer::backdrop{background:rgba(24,50,68,.72)}.viewer header{position:sticky;top:0;display:flex;justify-content:space-between;padding:10px 16px;background:white;border-bottom:1px solid var(--line);z-index:1}.viewer img{max-width:none;width:auto;height:auto}.viewer button,.utility{padding:6px 12px;border:1px solid #92a9b4;background:white;border-radius:4px;cursor:pointer}.no-script{font-size:14px}.hidden-screen{display:none}.screen-count{font-size:14px}.skip{position:absolute;left:-9999px}.skip:focus{left:260px;top:8px;background:white;padding:10px;z-index:3}
@media(max-width:900px){.side{position:static;width:auto;padding:20px}.side nav{display:flex;gap:16px;flex-wrap:wrap}.side input{max-width:450px}main{margin:0;padding:28px 20px}.hero{padding-left:16px}.viewer{height:95vh}}
@media print{.side,.utility,.viewer,.back-link{display:none}main{margin:0;padding:0}.screen{break-before:page}.screen img{max-width:100%}pre{max-height:none}.hidden-screen{display:block}}
'''


def table(headers, rows):
    return '<div class="table-wrap"><table><thead><tr>' + ''.join('<th>' + esc(header) + '</th>' for header in headers) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>' + cell + '</td>' for cell in row) + '</tr>' for row in rows) + '</tbody></table></div>'


def controls(screen):
    inv = screen.get('inventory', {})
    rows = []
    for button in inv.get('buttons', []):
        if isinstance(button, str):
            button = {'name': button}
        rows.append([esc(button.get('name', button.get('label', ''))), 'Button', esc('Disabled' if button.get('disabled') else 'Visible in captured state'), 'Read the handler and audit before inferring the save effect.'])
    for field in inv.get('fields', []):
        rows.append([esc(field.get('label', '')), esc(field.get('type', 'Field')), esc(field.get('value', '')), esc(' · '.join(str(option) for option in field.get('options', []) or []))])
    for control in inv.get('controls', []):
        rows.append([esc(control.get('label', '')), esc(control.get('type', control.get('tag', 'Control'))), esc(control.get('value', '')), esc(control.get('meaning', 'Read captured source/handler'))])
    return table(['Control / field', 'Type', 'Captured value / state', 'Options / responsibility'], rows) if rows else '<p>No separate control inventory was saved for this earlier image. Use the current capture, full operations context and exact source inventory.</p>'


def render_md(text, prefix):
    rendered = markdown.markdown(text, extensions=['tables', 'fenced_code', 'toc'])
    rendered = re.sub(r'id="([^"]+)"', lambda match: f'id="{prefix}-{match[1]}"', rendered)
    return re.sub(r'href="#([^"]+)"', lambda match: f'href="#{prefix}-{match[1]}"', rendered)


def build_module(module, inputs, vendor, captures, git_head, quality=WEBP_QUALITY):
    prefix, title, filename = MODULES[module]
    folder = DOCS / module
    operations = (folder / f'{prefix}-module-ux-operational-context.md').read_text(encoding='utf-8')
    audit = (folder / f'{prefix}-current-audit.md').read_text(encoding='utf-8')
    instructions = (REF / 'READ-FIRST.md').read_text(encoding='utf-8')
    sources = source_records(module)
    screens = current_screens(module, captures, quality) + prior_screens(module, prefix, quality)
    if module == 'finance':
        screens += contextual_finance(captures, quality)
    exclusions = []
    for screen in screens:
        retained = []
        for image in screen['images']:
            if image['id'] in INCOMPLETE_IMAGES:
                exclusions.append({'imageId': image['id'], 'screenId': screen['id'],
                    'reason': INCOMPLETE_IMAGES[image['id']]})
            else:
                image['sourceSequence'] = image['sequence']
                image['sequence'] = len(retained) + 1
                retained.append(image)
        screen['images'] = retained
    screens = [screen for screen in screens if screen['images']]
    ids = [screen['id'] for screen in screens]
    assert len(ids) == len(set(ids)), 'Duplicate screen IDs'
    manifest = [{**screen, 'images': [{k: v for k, v in image.items() if k != 'data'} for image in screen['images']]} for screen in screens]
    state_coverage = coverage(module, sources, screens)
    state_coverage['excludedIncompleteCaptures'] = exclusions
    data = baseline(module, inputs, vendor)
    metadata = {'schemaVersion': 1, 'module': module, 'title': title, 'reviewed': '5 October 2026',
        'sourceCommit': git_head, 'sourceIncludesWorkingCopy': True,
        'screenStates': len(screens), 'images': state_coverage['imageCount'], 'sourceFiles': len(sources),
        'currentStates': state_coverage['currentStates'], 'earlierStates': state_coverage['earlierStates'],
        'contextualStates': state_coverage['contextualStates'], 'remainingStateGroups': len(state_coverage['remainingStates']),
        'imageEncoding': {'webpQuality': quality, 'resized': False, 'originalCapturesRetained': True,
            'policy': 'High-quality WebP only when smaller; otherwise original image bytes', 'maxHtmlBytes': MAX_HTML_BYTES},
        'truthBoundary': 'Current inspected source and real captures, not every possible permutation or a production backend. Remaining screenshot gaps are explicit.'}
    extractor = (ROOT / 'scripts/extract-product-agent-handoff.py').read_text(encoding='utf-8')
    parts = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | Paryatech agent context</title><style>{CSS}</style></head><body><a class="skip" href="#main">Skip to reference</a>',
        f'<aside class="side"><strong>Paryatech<br>{esc(title)}</strong><p>Operational context and actual UI evidence<br>Reviewed 5 October 2026</p><nav>',
        ''.join(f'<a href="#{target}">{label}</a>' for target, label in [('read-first', 'Agent reading instructions'), ('audit', 'Current source audit'), ('coverage', 'Coverage and remaining states'), ('operations', 'Complete flow context'), ('baseline', 'Exact fixture baseline'), ('screen-index', 'All screens and dialogs'), ('sources', 'Source reference'), ('extract', 'Extract for an agent')]),
        '</nav><p><label for="screen-search">Find a screenshot</label><input id="screen-search" type="search" placeholder="Name, field, dialog or state"></p><p id="search-count"></p><p><a href="../agent-context-index.html">Other module guides</a></p></aside><main id="main">',
        f'<header class="hero"><h1>{esc(title)}<br>Complete agent reference</h1><p>Read the user flows, operational responsibilities, fields, dialogs, outcomes and current limits together with their real UI screenshots.</p><p class="reading-rule">Inspect every image and source branch. Use the coverage ledger to identify gaps before implementing.</p><div class="facts"><span><b>{len(screens)}</b>documented states</span><span><b>{metadata["images"]}</b>embedded UI images</span><span><b>{len(sources)}</b>source files</span><span><b>{metadata["remainingStateGroups"]}</b>remaining state groups</span></div><p class="gap">This reference includes current and earlier captures. Conditional or uncaptured UI is listed explicitly below. Screenshot count does not establish that every possible UI permutation or backend flow is complete.</p></header>',
        '<section class="section prose" id="read-first"><h2>Instructions for the receiving agent</h2>', render_md(instructions, 'instructions'), f'<details><summary>Exact instructions as Markdown</summary><pre id="agent-instructions">{esc(instructions)}</pre></details></section>',
        '<section class="section prose" id="audit"><h2>Current source and interaction audit</h2>', render_md(audit, 'audit'), f'<details><summary>Exact audit as Markdown</summary><pre id="current-audit">{esc(audit)}</pre></details></section>',
        '<section class="section" id="coverage"><h2>Coverage and remaining states</h2>', table(['Evidence', 'States'], [[esc(key), str(value)] for key, value in [('Current captures', metadata['currentStates']), ('Earlier real captures', metadata['earlierStates']), ('Contextual Finance captures', metadata['contextualStates'])]]),
        '<p>These conditions remain <strong>not screenshot verified</strong>. Their source and operating rules are embedded. The receiving agent must resolve or explicitly preserve each gap.</p>',
        table(['State', 'Source', 'Why it is not pictured'], [[esc(state['description']), esc(state['source']), esc(state['reason'])] for state in state_coverage['remainingStates']]),
        '<h3>Image QA exclusions</h3><p>Unfinished paint/animation frames were excluded. They do not represent an empty product state. Use the rendered continuation or replacement named below.</p>',
        table(['Excluded image', 'Reason / usable evidence'], [[esc(item['imageId']), esc(item['reason'])] for item in exclusions]) if exclusions else '<p>No additional unfinished frames were excluded from this module during final gallery QA.</p>',
        '<details><summary>Complete source inventory and review candidates</summary><pre>', esc(pretty(state_coverage)), '</pre></details></section>',
        '<section class="section prose" id="operations"><h2>Complete UX and operational context</h2><p>The current audit above takes precedence where earlier prose differs from inspected source. Read every chapter; design styling is supporting context.</p>', render_md(operations, 'flow'), f'<details><summary>Exact operational context as Markdown</summary><pre id="operational-context">{esc(operations)}</pre></details></section>',
        '<section class="section" id="baseline"><h2>Exact evaluated fixture baseline</h2><p>Complete records and identities, including relationships, numerical values, nulls and source provenance. This is not a production database or an export of transient screenshot scenario state.</p><button class="utility" data-download="baseline-json" data-name="baseline.json">Download baseline JSON</button>']
    for key, value in data.items():
        parts.append(f'<details><summary>{esc(key)}' + (f' — {len(value)} records' if isinstance(value, list) else '') + f'</summary><pre>{esc(pretty(value))}</pre></details>')
    parts += ['</section><section class="section" id="screen-index"><h2>All UI screens, states and dialogs</h2><p>Current evidence appears first. Earlier images are retained for unrecaptured states and comparison. Scroll continuations belong to the same state. Click an image for its original dimensions.</p>',
        table(['Screen / state', 'Evidence', 'Entry'], [[f'<a href="#screen-{esc(screen["id"])}">{esc(screen["title"])}</a><br><small>{esc(screen["id"])}</small>', esc(screen['evidence']), esc(screen.get('entry', ''))] for screen in screens]), '</section>']
    for screen in screens:
        parts += [f'<section class="screen" id="screen-{esc(screen["id"])}" data-screen-state="{esc(screen["id"])}"><h2>{esc(screen["title"])}</h2><p><span class="badge">{esc(screen["id"])}</span><span class="badge">{esc(screen["group"])}</span></p><p><strong>Evidence:</strong> {esc(screen["evidence"])}<br><strong>Entry:</strong> {esc(screen.get("entry", ""))}</p>',
            f'<p><strong>Purpose and behavior:</strong> {esc(screen.get("purpose", ""))}</p>']
        if screen.get('behavior') != screen.get('purpose'):
            parts.append(f'<p>{esc(screen.get("behavior", ""))}</p>')
        for image in screen['images']:
            parts.append(f'<figure><img data-image-id="{esc(image["id"])}" src="{image["data"]}" width="{image["width"]}" height="{image["height"]}" loading="lazy" alt="{esc(screen["title"])} — capture {image["sequence"]}"><figcaption>Actual UI capture {image["sequence"]} of {len(screen["images"])}. Original dimensions {image["width"]} × {image["height"]}. Inspect this image as well as the text.</figcaption></figure>')
        if screen.get('next'):
            parts.append('<h3>Next actions and outcomes</h3><pre>' + esc(pretty(screen['next'])) + '</pre>')
        if screen.get('context'):
            parts.append('<h3>Operational context</h3><pre>' + esc(pretty(screen['context'])) + '</pre>')
        parts += ['<details><summary>Fields, actions, options and captured state</summary>', controls(screen), '</details>']
        text = screen.get('pageText') or screen.get('inventory', {}).get('text', '')
        if text:
            parts += ['<details><summary>Complete captured page text</summary><pre>', esc(text), '</pre></details>']
        parts += ['<p class="back-link"><a href="#screen-index">Return to screen index</a></p></section>']
    parts += ['<section class="section source-list" id="sources"><h2>Exact current source evidence</h2><p>Each file is embedded with its SHA256 and original bytes. Read all applicable files. The field/state marker inventory is advisory; complete source is the authority. Test-only approved supplier/tax inputs are not genuine source approvals.</p>']
    for source in sources:
        display = re.sub(r'data:image/[^\s"\']+', '[embedded image bytes retained in extractable source]', source['text'])
        parts.append(f'<details data-source-path="{esc(source["path"])}"><summary>{esc(source["path"])}</summary><p>SHA256: {esc(source["sha256"])}</p><pre>{esc(display)}</pre></details>')
    parts += ['</section><section class="section" id="extract"><h2>Extract the single HTML for an agent</h2><p>Copy this helper to a Python file and run the command below. Only Python’s standard library is needed. It extracts the contexts, full fixture JSON, every screenshot with a manifest, byte-exact source files, and TODO review ledgers. It checks image/source hashes and refuses to overwrite a nonempty folder.</p>',
        f'<pre>python extract-product-agent-handoff.py {esc(filename)} NEW_OUTPUT_FOLDER</pre><details><summary>Complete Python extraction helper</summary><pre id="extractor-code">{esc(extractor)}</pre></details><button class="utility" id="download-extractor">Download extraction helper</button><p>Source commit: {esc(git_head)}. Source snapshots include the working copy at review time. This documentation does not commit, deploy, move or merge the project.</p></section>',
        f'<script id="handoff-metadata-json" type="application/json">{script_json(metadata)}</script>',
        f'<script id="baseline-json" type="application/json">{script_json(data)}</script>',
        f'<script id="screen-manifest-json" type="application/json">{script_json(manifest)}</script>',
        f'<script id="source-coverage-json" type="application/json">{script_json(state_coverage)}</script>',
        f'<script id="source-reference-json" type="application/json">{script_json([{k:v for k,v in source.items() if k != "text"} for source in sources])}</script>',
        '</main><dialog class="viewer" id="image-viewer"><header><span id="image-caption"></span><button type="button" id="close-viewer">Close image</button></header><img id="enlarged-image" alt=""></dialog>',
        '''<script>
const search=document.getElementById('screen-search'),states=[...document.querySelectorAll('[data-screen-state]')];
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let n=0;states.forEach(s=>{const ok=!q||s.textContent.toLowerCase().includes(q);s.classList.toggle('hidden-screen',!ok);if(ok)n++});document.getElementById('search-count').textContent=q?n+' matching states. Clear search to read all.':''});
const viewer=document.getElementById('image-viewer');document.querySelectorAll('img[data-image-id]').forEach(img=>{img.tabIndex=0;const open=()=>{const full=document.getElementById('enlarged-image');full.src=img.src;full.alt=img.alt;document.getElementById('image-caption').textContent=img.alt;viewer.showModal()};img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();open()}})});document.getElementById('close-viewer').addEventListener('click',()=>viewer.close());
function download(text,name,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
document.getElementById('download-extractor').addEventListener('click',()=>download(document.getElementById('extractor-code').textContent,'extract-product-agent-handoff.py'));document.querySelectorAll('[data-download]').forEach(b=>b.addEventListener('click',()=>download(document.getElementById(b.dataset.download).textContent,b.dataset.name,'application/json')));
</script></body></html>''']
    content = ''.join(parts).encode('utf-8')
    if len(content) >= MAX_HTML_BYTES:
        lower_quality = {95: 92, 92: 90, 90: 88}.get(quality)
        if lower_quality is not None:
            print(f'{filename}: {len(content):,} bytes at quality {quality}; trying {lower_quality}', flush=True)
            return build_module(module, inputs, vendor, captures, git_head, lower_quality)
        raise ValueError(f'{filename} is {len(content):,} bytes; must be below {MAX_HTML_BYTES:,}')
    (folder / filename).write_bytes(content)
    (folder / f'{prefix}-complete-context.md').write_text(instructions + '\n\n' + audit + '\n\n' + operations, encoding='utf-8')
    (folder / f'{prefix}-screen-manifest.json').write_text(pretty(manifest) + '\n', encoding='utf-8')
    (folder / f'{prefix}-source-coverage.json').write_text(pretty(state_coverage) + '\n', encoding='utf-8')
    return {**metadata, 'path': (folder / filename).relative_to(DOCS).as_posix(), 'bytes': (folder / filename).stat().st_size}


def build_index(reports):
    cards = ''.join(f'<article><h2><a href="{esc(report["path"])}">{esc(report["title"])}</a></h2><p>{report["screenStates"]} states · {report["images"]} embedded screenshots · {report["sourceFiles"]} source files · {report["bytes"] / 1_000_000:.2f} MB</p><p>{report["currentStates"]} current states, {report["earlierStates"]} earlier states, {report["contextualStates"]} contextual states. {report["remainingStateGroups"]} remaining state groups are explicitly listed in the guide.</p></article>' for report in reports)
    content = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Paryatech | Product context library</title><style>{CSS}main{{margin:0;max-width:1100px;margin:auto}}article{{padding:26px 0;border-top:1px solid var(--line)}}.chain{{padding:22px;background:var(--wash);font-size:18px;line-height:2}}</style></head><body><main><header class="hero"><h1>One product.<br>Four module references.</h1><p>Complete operational context, real screenshots, current source, exact fixtures and instructions for the receiving agent. Reviewed 5 October 2026.</p></header><p class="chain">Vendor supplier and rate card → Package → Customer Proposal → Booking fulfilment → Finance obligation and recorded external money<br>Destination connects discovery to the owning modules.</p><p class="gap">Each HTML is independently shareable and contains its own images, context and extraction helper. Conditional and uncaptured states are named explicitly. An agent must inspect the full manifest and source before declaring coverage complete.</p>{cards}<article><h2>Vendor CRM</h2><p><a href="vendors/vendor-crm-agent-handoff.html">Existing Vendor CRM agent handoff</a>. The All Finance guide embeds the relevant Vendor Finance screenshots.</p></article><section><h2>Use with the next agent</h2><ol><li>Send the relevant standalone HTML files.</li><li>Ask the agent to follow the included READ-FIRST procedure and extract the images/context.</li><li>Require an image/flow/source review ledger before implementation.</li><li>Start the next product agenda only after the agent identifies current behavior, prototype limits and remaining screenshot gaps.</li></ol></section></main></body></html>'''
    (DOCS / 'agent-context-index.html').write_text(content, encoding='utf-8')
    (REF / 'handoff-build-report.json').write_text(pretty(reports) + '\n', encoding='utf-8')


def build():
    inputs = json.loads((REF / 'product-source-fixtures.json').read_text(encoding='utf-8'))
    vendor = json.loads((DOCS / 'vendors/vendor-crm-exact-catalogue.json').read_text(encoding='utf-8'))
    captures = json.loads((REF / 'current-captures.json').read_text(encoding='utf-8'))
    git_head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    reports = [build_module(module, inputs, vendor, captures, git_head) for module in MODULES]
    build_index(reports)
    print(pretty(reports))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    build()
