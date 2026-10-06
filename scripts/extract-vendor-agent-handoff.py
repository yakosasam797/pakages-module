"""Extract a standalone agent handoff using Python's standard library only.

python extract-vendor-agent-handoff.py vendor-crm-agent-handoff.html OUTPUT_DIRECTORY
The output directory must be new or empty. No application data is modified.
"""
from pathlib import Path
from html.parser import HTMLParser
import base64
import csv
import hashlib
import json
import re
import sys


class HandoffParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.scripts = {}
        self.images = {}
        self.texts = {}
        self.active_script = None
        self.active_pre = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'script' and a.get('type') == 'application/json':
            self.active_script = a.get('id')
            self.scripts[self.active_script] = ''
        if tag == 'pre' and a.get('id') in ('operational-context', 'agent-instructions'):
            self.active_pre = a['id']
            self.texts[self.active_pre] = ''
        if tag == 'img' and a.get('data-screen-id'):
            self.images[a['data-screen-id']] = a['src']

    def handle_endtag(self, tag):
        if tag == 'script':
            self.active_script = None
        if tag == 'pre':
            self.active_pre = None

    def handle_data(self, text):
        if self.active_script:
            self.scripts[self.active_script] += text
        if self.active_pre:
            self.texts[self.active_pre] += text


def safe(value):
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', str(value))


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def extract(source, output):
    parser = HandoffParser()
    parser.feed(source.read_text(encoding='utf-8'))
    catalogue = json.loads(parser.scripts['catalogue-json'])
    screens = json.loads(parser.scripts['screen-manifest-json'])
    if output.exists() and any(output.iterdir()):
        raise ValueError('Output directory is not empty; choose a new directory.')
    output.mkdir(parents=True, exist_ok=True)
    dump(output / 'catalogue.json', catalogue)
    dump(output / 'screens.json', screens)
    dump(output / 'record-hashes.json', json.loads(parser.scripts['record-hashes-json']))
    for source_file in json.loads(parser.scripts.get('operational-source-json', '[]')):
        relative = Path(source_file['path'])
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('Unsafe source path')
        target = output / 'source-reference' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(source_file['text'], encoding='utf-8', newline='')
    for key, name in [('operational-context', 'operational-context.md'), ('agent-instructions', 'READ-FIRST.md')]:
        (output / name).write_text(parser.texts[key], encoding='utf-8')
    for collection, records in catalogue.items():
        if not isinstance(records, list):
            continue
        for index, record in enumerate(records):
            key = record.get('id', record.get('cardId', index)) if isinstance(record, dict) else index
            vendor = record.get('vendorId', '') if isinstance(record, dict) else ''
            dump(output / 'records' / collection / f'{safe(vendor + "_" if vendor else "")}{safe(key)}.json', record)
    for screen in screens:
        key = screen['id']
        prefix, encoded = parser.images[key].split(',', 1)
        if prefix != 'data:image/webp;base64':
            raise ValueError(f'Unexpected image encoding: {key}')
        raw = base64.b64decode(encoded, validate=True)
        if raw[:4] != b'RIFF' or raw[8:12] != b'WEBP':
            raise ValueError(f'Invalid WebP: {key}')
        folder = output / 'screens' / safe(key)
        folder.mkdir(parents=True)
        (folder / 'image.webp').write_bytes(raw)
        dump(folder / 'context.json', screen)
    with (output / 'screen-review-ledger.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['screen_id', 'evidence', 'group', 'title', 'image_inspected', 'context_read', 'target_route', 'target_screenshot', 'controls_verified', 'logic_verified', 'result', 'gap_or_exception'])
        for s in screens:
            writer.writerow([s['id'], s['evidence'], s['group'], s['title'], '', '', '', '', '', '', 'TODO', ''])
    with (output / 'record-review-ledger.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['collection', 'record_id', 'vendor_id', 'source_sha256', 'target_identity', 'values_equal', 'relationships_equal', 'result', 'exception'])
        for r in json.loads(parser.scripts['record-hashes-json']):
            writer.writerow([r['collection'], r['id'], r['vendorId'], r['sha256'], '', '', '', 'TODO', ''])
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    print(json.dumps({'counts': catalogue['counts'], 'screens': len(screens), 'extracted_images': len(parser.images), 'html_sha256': digest, 'output': str(output.resolve())}, indent=2))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: python extract-vendor-agent-handoff.py INPUT.html NEW_OUTPUT_DIRECTORY')
    extract(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve())
