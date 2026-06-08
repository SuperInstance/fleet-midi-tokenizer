/** JSON Schema for MIDI token sequences matching fleet protocol */
const TOKEN_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MIDI Token Sequence",
  "type": "object",
  "required": ["tokens", "stats"],
  "properties": {
    "prompt": { "type": "string", "description": "Original text prompt" },
    "generated_at": { "type": "string", "format": "date-time" },
    "midi_file": { "type": "string", "description": "Path to source MIDI" },
    "stats": {
      "type": "object",
      "required": ["tracks", "total_events", "note_count"],
      "properties": {
        "tracks": { "type": "integer" },
        "ticks_per_beat": { "type": "integer" },
        "total_events": { "type": "integer" },
        "note_count": { "type": "integer" }
      }
    },
    "tokens": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[HTKSEPNF]:[0-9]+(:[0-9]+)*$"
      },
      "description": "REMI-style token sequence"
    }
  }
};

module.exports = { TOKEN_SCHEMA };
