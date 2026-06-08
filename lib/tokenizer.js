/**
 * REMI-style MIDI tokenizer for the fleet.
 * Converts between Standard MIDI Files and ternary token sequences.
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

// Token type encoding
const TOKEN_TYPES = {
  HEADER: 'H', TEMPO: 'T', KEY: 'K', TIME_SIG: 'S',
  TRACK: 'E', PROGRAM: 'P', NOTE_ON: 'N', NOTE_OFF: 'F',
};

// Find correct Python
function findPython() {
  const candidates = ['python3.10', 'python3.12', 'python3.11', 'python3', 'python'];
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ['-c', 'import music21; print(1)'], {timeout:3000, encoding:'utf8'});
      if (r.stdout.trim() === '1') return c;
    } catch(_) {}
  }
  return 'python3';
}

function pythonExec(code) {
  const py = findPython();
  const result = spawnSync(py, ['-c', code], {timeout:15000, encoding:'utf8'});
  if (result.error) throw result.error;
  const lines = result.stdout.trim().split('\n').filter(l => l.startsWith('{'));
  if (lines.length === 0) throw new Error(`No JSON output. stderr: ${result.stderr}`);
  return JSON.parse(lines[lines.length - 1]);
}

function tokenize(midiPath) {
  const pyCode = `
import music21, json, sys
m = music21.converter.parse('${midiPath.replace(/'/g, "\\'")}')
tokens = []
flat = m.flat
for i, p in enumerate(m.parts):
    tokens.append(f'E:{i}:0')
    n = list(p.flat.notes)
    for nb in n:
        pitch = nb.pitch.midi if hasattr(nb, 'pitch') else 60
        vel = nb.volume.realized if hasattr(nb, 'volume') else 90
        dur = nb.duration.quarterLength
        tokens.append(f'N:{pitch}:{int(vel)}:{int(dur*10080)}')
        tokens.append(f'F:{pitch}:0')
print(json.dumps({"tokens": tokens, "count": len(tokens), "tracks": len(m.parts)}))
`;
  return pythonExec(pyCode);
}

function decode(tokens) {
  const pyCode = `
import music21, json, sys
from music21 import stream, note, tempo, key, meter
tokens = json.loads('''${JSON.stringify(tokens)}''')
s = stream.Score()
cp = stream.Part()
cp.append(key.Key('C'))
cp.append(meter.TimeSignature('4/4'))
cp.append(tempo.MetronomeMark(number=120))
for t in tokens:
    parts = t.split(':')
    tp = parts[0]
    if tp == 'N':
        pitch, vel, dur = int(parts[1]), int(parts[2]), int(parts[3])
        n = note.Note(pitch, quarterLength=dur/10080)
        n.volume.velocity = vel
        cp.append(n)
    elif tp == 'E':
        if cp.hasMeasures():
            s.append(cp)
        cp = stream.Part()
s.append(cp)
out = '/tmp/decoded.mid'
s.write('midi', fp=out)
print(json.dumps({"file": out, "notes": len(list(cp.flat.notes))}))
`;
  return pythonExec(pyCode).file;
}

module.exports = { tokenize, decode, TOKEN_TYPES };

if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'tokenize' && args[0]) {
    console.log(JSON.stringify(tokenize(args[0]), null, 2));
  } else if (cmd === 'decode' && args[0]) {
    const result = decode(JSON.parse(args[0]));
    console.log(JSON.stringify({file: result}));
  } else {
    console.log('Usage: node tokenizer.js tokenize <midi_file>');
  }
}
