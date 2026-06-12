/**
 * @file session-mode.ts
 *
 * Owns the text/voice modality of a single {@link voice.AgentSession}.
 *
 * The session always carries the full STT/TTS/VAD pipeline; modality is just
 * whether audio I/O is enabled. `mode` is derived from
 * `session.input.audioEnabled` (single source of truth) rather than a separate
 * boolean field, so it can never drift from the actual session state.
 */
import { voice } from '@livekit/agents';
import type { SessionMode } from '../types/session-mode';

export class SessionModeController {
  constructor(private readonly session: voice.AgentSession) {}

  get mode(): SessionMode {
    return this.session.input.audioEnabled ? 'voice' : 'text';
  }

  enableVoice(): SessionMode {
    this.session.input.setAudioEnabled(true);
    this.session.output.setAudioEnabled(true);
    return this.mode;
  }

  disableVoice(): SessionMode {
    this.session.interrupt();
    this.session.input.setAudioEnabled(false);
    this.session.output.setAudioEnabled(false);
    return this.mode;
  }

  set(enabled: boolean): SessionMode {
    return enabled ? this.enableVoice() : this.disableVoice();
  }
}
