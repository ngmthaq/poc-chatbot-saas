import type { CreateIngressOptions, IngressInput } from 'livekit-server-sdk';

export interface LiveKitCreateIngressRequest {
  inputType: IngressInput;
  options: CreateIngressOptions;
}

export type { CreateIngressOptions, IngressInput } from 'livekit-server-sdk';
