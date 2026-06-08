# fleet-midi-tokenizer 🔤

> *REMI MIDI tokenization for the fleet*

The lingua franca of the music fleet. Every MIDI event becomes a token sequence fleet agents can reason about, compose, and transport.

## Token Types

| Code | Meaning |
|------|---------|
| H | Header (format, tracks, ticks) |
| T | Tempo |
| K | Key signature |
| S | Time signature |
| E | Track boundary |
| P | Program change (instrument) |
| N | Note on |
| F | Note off |

## Related
- [fleet-midi-text2midi](https://github.com/SuperInstance/fleet-midi-text2midi)
- [fleet-midi-generator](https://github.com/SuperInstance/fleet-midi-generator)
