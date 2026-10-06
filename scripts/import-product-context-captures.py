"""Import T3 screenshots without retaining workstation paths in the handoff."""
from pathlib import Path
import hashlib
import json
import os
import sys

sys.path.insert(0, str(Path(os.environ['TEMP']) / 'paryatech-context-tools'))
from PIL import Image

root = Path(__file__).resolve().parents[1]
folder = root / 'docs/modules/agent-reference'
incoming = folder / 'current-capture-input.json'
records = json.loads(incoming.read_text(encoding='utf-8'))
manifest = folder / 'current-captures.json'
existing = json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else []
merged = {(record['module'], record['id']): record for record in existing}
seen = set()
for record in records:
    key = (record['module'], record['id'])
    if key in seen:
        raise ValueError(f'Duplicate current screen: {key}')
    seen.add(key)
    record['captures'] = []
    for index, source in enumerate(record.pop('paths'), 1):
        target = folder / 'assets' / record['module'] / f"{record['id']}-{index}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            image.convert('RGB').save(target, 'WEBP', lossless=True, method=6)
        raw = target.read_bytes()
        record['captures'].append({'path': target.relative_to(root).as_posix(),
            'sha256': hashlib.sha256(raw).hexdigest(), 'sequence': index,
            'width': image.width, 'height': image.height})
    merged[key] = record
records = list(merged.values())
manifest.write_text(json.dumps(records, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
incoming.unlink()
print(json.dumps({'states': len(records), 'images': sum(len(r['captures']) for r in records)}))
