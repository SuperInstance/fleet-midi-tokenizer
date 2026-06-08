/**
 * REMI-style MIDI tokenizer for the fleet.
 * Converts between Standard MIDI Files and ternary token sequences.
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

// Token type encoding (REMI variant for fleet transport)
const TOKEN_TYPES = {
  HEADER: 'H',     // format, tracks, ticks
  TEMPO: 'T',      // tempo in μs/quarter
  KEY: 'K',        // key signature
  TIME_SIG: 'S',   // time signature
  TRACK: 'E',      // track boundary
  PROGRAM: 'P',    // instrument program
  NOTE_ON: 'N',    // note on: pitch:velocity:duration
  NOTE_OFF: 'F',   // note off marker
};

function tokenize(midiPath) {
  // Use music21 Python backend for accurate parsing
  const pyCode = `
import music21, json, sys
m = music21.converter.parse(sys.argv[1])
tokens = []
flat = m.flat

# Header
tokens.append(f'H:{m.metadata.duration.quarterLength if m.metadata else 0}:{len(m.parts)}:{len(list(flat.notes))}:{len(list(flat.notes))}')

# Tempo
tempos = flat.getElementsByClass('MetronomeMark')
if tempos:
    t = tempos[0]
    tokens.append(f'T:0:{int(t.duration.quarterLength * 500000)}')
else:
    tokens.append('T:0:500000')

# Key
keys = flat.getElementsByClass('KeySignature')
if keys:
    tokens.append(f'K:0:{keys[0].sharps}')
else:
    tokens.append('K:0:0')

# Time signature
times = flat.getElementsByClass('TimeSignature')
if times:
    tokens.append(f'S:0:{times[0].ratioString}')
else:
    tokens.append('S:0:4/4')

# Track events
for i, p in enumerate(m.parts):
    tokens.append(f'E:{i}:0')
    n = list(p.flat.notes)
    for note_obj in n:
        pitch = note_obj.pitch.midi if hasattr(note_obj, 'pitch') else 60
        vel = note_obj.volume.realized if hasattr(note_obj, 'volume') else 90
        dur = note_obj.duration.quarterLength
        tokens.append(f'N:{pitch}:{int(vel)}:{int(dur*10080)}')
        tokens.append(f'F:{pitch}:0')

print(json.dumps({"tokens": tokens, "count": len(tokens), "tracks": len(m.parts)}))
`;
  const result = spawnSync('python3', ['-c', pyCode, midiPath], {
    timeout: 10000,
    encoding: 'utf8'
  });
  if (result.error) throw result.error;
  return JSON.parse(result.stdout.trim().split('\n').pop());
}

function decode(tokens) {
  // Convert token sequences back to music21 notation (Python bridge)
  const pyCode = `
import music21, json, sys
from music21 import stream, note, chord, tempo, key, meter
tokens = json.loads(sys.argv[1])

s = stream.Score()
current_part = stream.Part()
current_part.append(key.Key('C'))
current_part.append(meter.TimeSignature('4/4'))
current_part.append(tempo.MetronomeMark(number=120))

for t in tokens:
    parts = t.split(':')
    tp = parts[0]
    if tp == 'N':
        pitch, vel, dur = int(parts[1]), int(parts[2]), int(parts[3])
        n = note.Note(pitch, quarterLength=dur/10080)
        n.volume.velocity = vel
        current_part.append(n)
    elif tp == 'E':
        if current_part.hasMeasures():
            s.append(current_part)
        current_part = stream.Part()

s.append(current_part)
out = '/tmp/decoded.mid'
s.write('midi', fp=out)
print(out)
`;
  const result = spawnSync('python3', ['-c', pyCode, JSON.stringify(tokens)], {
    timeout: 10000,
    encoding: 'utf8'
  });
  if (result.error) throw result.error;
  return result.stdout.trim().split('\n').pop();
}

module.exports = { tokenize, decode, TOKEN_TYPES };

// CLI mode
if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'tokenize' && args[0]) {
    console.log(JSON.stringify(tokenize(args[0]), null, 2));
  } else if (cmd === 'decode') {
    const tokens = JSON.parse(args[0]);
    console.log(decode(tokens));
  } else {
    console.log('Usage: node tokenizer.js tokenize <midi_file> | decode \'[token, ...]\'');
  }
}
