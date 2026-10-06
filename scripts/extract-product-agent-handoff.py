"""Extract a portable product context HTML. Python standard library only.

Usage: python extract-product-agent-handoff.py INPUT.html NEW_OUTPUT_FOLDER
Refuses to overwrite nonempty folders. Extracted source is reference material.
"""
from pathlib import Path
from html.parser import HTMLParser
import base64
import csv
import hashlib
import json
import re
import sys


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.scripts, self.images, self.texts = {}, {}, {}
        self.script = self.pre = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('type') == 'application/json':
            self.script = attrs.get('id')
            self.scripts[self.script] = ''
        if tag == 'pre' and attrs.get('id') in ('agent-instructions', 'operational-context', 'current-audit'):
            self.pre = attrs['id']
            self.texts[self.pre] = ''
        if tag == 'img' and attrs.get('data-image-id'):
            key = attrs['data-image-id']
            if key in self.images:
                raise ValueError(f'Duplicate image ID: {key}')
            self.images[key] = attrs['src']

    def handle_endtag(self, tag):
        if tag == 'script':
            self.script = None
        if tag == 'pre':
            self.pre = None

    def handle_data(self, value):
        if self.script:
            self.scripts[self.script] += value
        if self.pre:
            self.texts[self.pre] += value


def safe(value):
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', str(value))


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def extract(source, output):
    parser = Parser()
    parser.feed(source.read_text(encoding='utf-8'))
    manifest = json.loads(parser.scripts['screen-manifest-json'])
    metadata = json.loads(parser.scripts['handoff-metadata-json'])
    expected = {image['id'] for screen in manifest for image in screen['images']}
    if expected != set(parser.images):
        raise ValueError('Manifest/image ID mismatch')
    if len(manifest) != metadata['screenStates'] or len(expected) != metadata['images']:
        raise ValueError('Declared count mismatch')
    if output.exists() and any(output.iterdir()):
        raise ValueError('Choose a new or empty output folder')
    output.mkdir(parents=True, exist_ok=True)
    for key, name in [('agent-instructions', 'READ-FIRST.md'), ('operational-context', 'context.md'), ('current-audit', 'audit.md')]:
        (output / name).write_text(parser.texts[key], encoding='utf-8')
    for key, name in [('baseline-json', 'baseline.json'), ('screen-manifest-json', 'screens.json'), ('source-coverage-json', 'source-coverage.json'), ('handoff-metadata-json', 'metadata.json')]:
        dump(output / name, json.loads(parser.scripts[key]))
    for source_file in json.loads(parser.scripts['source-reference-json']):
        relative = Path(source_file['path'])
        if relative.is_absolute() or '..' in relative.parts or ':' in str(relative):
            raise ValueError('Unsafe source path')
        raw = base64.b64decode(source_file['bytesBase64'], validate=True)
        if hashlib.sha256(raw).hexdigest() != source_file['sha256']:
            raise ValueError(f"Source hash mismatch: {source_file['path']}")
        target = output / 'source-reference' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
    for screen in manifest:
        folder = output / 'screens' / safe(screen['id'])
        folder.mkdir(parents=True)
        dump(folder / 'context.json', screen)
        for image in screen['images']:
            prefix, encoded = parser.images[image['id']].split(',', 1)
            raw = base64.b64decode(encoded, validate=True)
            if prefix == 'data:image/webp;base64':
                extension, valid = 'webp', raw[:4] == b'RIFF' and raw[8:12] == b'WEBP'
            elif prefix == 'data:image/png;base64':
                extension, valid = 'png', raw.startswith(b'\x89PNG\r\n\x1a\n')
            elif prefix in ('data:image/jpeg;base64', 'data:image/jpg;base64'):
                extension, valid = 'jpg', raw.startswith(b'\xff\xd8')
            else:
                raise ValueError(f'Unsupported image format: {prefix}')
            if not valid or hashlib.sha256(raw).hexdigest() != image['sha256']:
                raise ValueError(f"Invalid image/hash: {image['id']}")
            (folder / f"{safe(image['id'])}.{extension}").write_bytes(raw)
    with (output / 'screen-review-ledger.csv').open('w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['screen_id', 'group', 'evidence', 'image_count', 'all_images_inspected', 'context_read', 'target_route', 'actions_verified', 'persistence_verified', 'result', 'gap'])
        for screen in manifest:
            writer.writerow([screen['id'], screen['group'], screen['evidence'], len(screen['images']), '', '', '', '', '', 'TODO', ''])
    coverage = json.loads(parser.scripts['source-coverage-json'])
    with (output / 'remaining-state-ledger.csv').open('w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['state_id', 'description', 'source', 'reason', 'image_captured', 'target_verified', 'result'])
        for state in coverage['remainingStates']:
            writer.writerow([state['id'], state['description'], state['source'], state['reason'], '', '', 'NOT SCREENSHOT VERIFIED'])
    print(json.dumps({'module': metadata['module'], 'states': len(manifest), 'images': len(expected),
        'source_files': len(json.loads(parser.scripts['source-reference-json'])),
        'html_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'output': str(output)}, indent=2))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: python extract-product-agent-handoff.py INPUT.html NEW_OUTPUT_FOLDER')
    extract(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve())
