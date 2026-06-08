<div align="center">

# 🔤 fleet-midi-tokenizer

> *REMI MIDI tokenization — the fleet musical lingua franca*

[![CI](https://img.shields.io/github/actions/workflow/status/SuperInstance/fleet-midi-tokenizer/ci.yml?style=flat-square&logo=github&label=CI)](https://github.com/SuperInstance/fleet-midi-tokenizer/actions)
[![npm](https://img.shields.io/badge/npm-%40superinstance%2Fmidi--tokenizer-cb3837?style=flat-square&logo=npm)](https://www.npmjs.com/package/@superinstance/midi-tokenizer)
[![Docker](https://img.shields.io/badge/docker-ghcr-2496ed?style=flat-square&logo=docker)](https://github.com/SuperInstance/fleet-midi-tokenizer/pkgs/container/fleet-midi-tokenizer)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](http://makeapullrequest.com)

---

Encodes Standard MIDI Format 1 files into REMI-style token sequences (H, T, K, S, E, N, F) and decodes them back to playable MIDI. Every agent can reason about music through tokens. Zero-dep CLI tool with JSON schema validation.

---

## 📦 Installation

```bash
# npm
npm install @superinstance/midi-tokenizer

# Docker
docker pull ghcr.io/superinstance/fleet-midi-tokenizer:latest

# Clone
git clone https://github.com/SuperInstance/fleet-midi-tokenizer.git
```

## 🚀 Quick Start

```bash
# Encode MIDI → tokens:
node lib/tokenizer.js tokenize path/to/file.mid

# Decode tokens → MIDI:
node -e "const t=require(\"./lib/tokenizer\"); const r=t.tokenize(\"file.mid\"); const out=t.decode(r.tokens); console.log(\"Decoded:\",out);"

# Programmatic:
const { tokenize, decode } = require("@superinstance/midi-tokenizer");
const result = tokenize("output.mid");
console.log(result.count + " tokens, " + result.tracks + " tracks");
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   MIDI File (.mid)              Token Sequence            │
│          │                              ▲                │
│          ▼                              │                │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │ music21  │───▶│ Tokenizer│───▶│ music21  │           │
│   │ Parse    │    │ Encode   │    │ Build    │           │
│   └──────────┘    └──────────┘    └──────────┘           │
│          │              │              ▲                   │
│          ▼              ▼              │                   │
│   Events           REMI Tokens      MIDI File             │
│   (notes,          [H:..., T:...,    (.mid)              │
│    tempo,           K:..., S:...,    round-trip           │
│    key,             E:..., N:...,    verified             │
│    tracks)          F:...]                               │
│                                                          │
│   Token types: H(header) T(tempo) K(key) S(time)         │
│                E(track) N(note on) F(note off)            │
└──────────────────────────────────────────────────────────┘
```

## 📡 API

### `tokenize(midiPath)` → TokenSequence
Parses a Standard MIDI Format 1 file and returns REMI token structure.

### `decode(tokens)` → MIDI file path
Reconstructs a playable MIDI file from a token sequence.

### CLI Usage
```bash
node lib/tokenizer.js tokenize file.mid
node lib/tokenizer.js decode "$(cat tokens.json)"
```

## 🧪 Beta Tested

Part of the [SuperInstance MIDI Fleet](https://github.com/SuperInstance/construct-coordination/blob/main/FLEET_MIDI.md). Every push verified via CI — zeroshot tests ensure zero-config operation out of the box.

## 🤝 Related

- [fleet-bridge](https://github.com/SuperInstance/fleet-bridge) — I2I bottle transport
- [construct-coordination](https://github.com/SuperInstance/construct-coordination) — Fleet catalog

---

<div align="center">
<sub>Built with 🔤 for the SuperInstance fleet • <a href="https://github.com/SuperInstance">github.com/SuperInstance</a></sub>
</div>
