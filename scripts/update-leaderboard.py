#!/usr/bin/env python3
"""Publish a validated, aggregate-only Field Station comparison export."""
import argparse
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
import json
import re

NAMES = {'human': ('Human-curated', 'Stable settings'), 'experimental': ('Human-curated', 'Experimental settings'), 'hybrid': ('Hybrid', 'Human + machine labels'), 'machine': ('Machine-only', 'Machine-generated labels')}

def snapshot(data):
    comparison = data['model_comparison']
    # Use the most recent completed four-lane result, never partial live counters.
    points = [p for p in comparison['points'] if set(NAMES).issubset(p.get('lanes', {}))]
    point = max(points, key=lambda p: p['epoch'])
    rows, support = [], None
    for lane, (name, detail) in NAMES.items():
        m = point['lanes'][lane]
        tp, tn, fp, fn = [m[k] for k in ('tp', 'tn', 'fp', 'fn')]
        if any(type(n) is not int or n < 0 for n in (tp, tn, fp, fn)):
            raise ValueError('Invalid confusion matrix')
        classes = (tp + fn, tn + fp)
        if not all(classes) or sum(classes) != point['count'] or (support is not None and support != classes):
            raise ValueError('Models must share the same evaluation population')
        support = classes
        values = [tp / classes[0], tp / (tp + fp) if tp + fp else 0, tn / classes[1], (tp + tn) / sum(classes)]
        score = 0 if 0 in values else 100 / sum(w / v for w, v in zip((.35, .25, .25, .15), values))
        rows.append(dict(lane=lane, name=name, detail=detail, score=round(score, 1), recall=values[0], precision=values[1], accuracy=values[3], false_positive_rate=fp / classes[1], version=point[lane + '_version'], settings_revision=point['settings_revisions'][lane]))
    rows.sort(key=lambda r: -r['score'])
    previous, rank = None, 0
    for i, row in enumerate(rows):
        if row['score'] != previous:
            rank = i + 1
        row['rank'], previous = rank, row['score']
    return dict(evaluated_at=datetime.fromtimestamp(point['epoch'], ZoneInfo('America/Los_Angeles')).isoformat(), scope=comparison['scope'], example_count=point['count'], models=rows, scoring=dict(method='weighted harmonic mean', recall=.35, precision=.25, specificity=.25, accuracy=.15))

def publish(data, root):
    rows = ''.join(f'<tr><th scope="row"><span class="model-place">{r["rank"]:02}</span><span class="model-description">{r["name"]}<small>{r["detail"]}</small></span></th><td class="model-score">{r["score"]:.1f}</td><td>{100*r["recall"]:.1f}%</td><td>{100*r["false_positive_rate"]:.1f}%</td></tr>' for r in data['models'])
    page = root / 'index.html'
    html = page.read_text()
    html, count = re.subn(r'(<table class="research-table">.*?<tbody>).*?(</tbody>)', lambda m: m[1] + rows + m[2], html, flags=re.S)
    if count != 1:
        raise ValueError('Expected exactly one leaderboard')
    stamp = datetime.fromisoformat(data['evaluated_at'])
    html = re.sub(r'<p class="research-snapshot">.*?</p>', f'<p class="research-snapshot"><span>{data["example_count"]:,} reviewed examples</span><time datetime="{data["evaluated_at"]}">{stamp.strftime("%b")} {stamp.day}, {stamp.year}</time></p>', html)
    html = re.sub(r'Model strategies ranked on the same [\d,]+ reviewed training examples', f'Model strategies ranked on the same {data["example_count"]:,} reviewed training examples', html)
    (root / 'assets/model-comparison.json').write_text(json.dumps(data, indent=2) + '\n')
    page.write_text(html)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('metrics', type=Path, help='JSON export of /api/observation-metrics?period=all')
    args = parser.parse_args()
    data = snapshot(json.loads(args.metrics.read_text()))
    publish(data, Path(__file__).resolve().parents[1] / 'dist')
    print(data['evaluated_at'], [(r['lane'], r['rank'], r['score']) for r in data['models']])
