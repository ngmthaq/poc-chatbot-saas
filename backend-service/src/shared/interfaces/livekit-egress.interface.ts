import type {
  EncodedFileOutput,
  EncodedOutputs,
  RoomCompositeOptions,
  SegmentedFileOutput,
  StreamOutput,
} from 'livekit-server-sdk';

export interface LiveKitStartRoomCompositeEgressRequest {
  roomName: string;
  output:
    | EncodedOutputs
    | EncodedFileOutput
    | StreamOutput
    | SegmentedFileOutput;
  options?: RoomCompositeOptions;
}

export type {
  EncodedFileOutput,
  EncodedOutputs,
  RoomCompositeOptions,
  SegmentedFileOutput,
  StreamOutput,
} from 'livekit-server-sdk';
