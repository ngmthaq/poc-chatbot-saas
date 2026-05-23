import { axiosInstance } from './axiosInstance';

export class RoomService {
  async join(identity: string, name?: string): Promise<{ roomName: string; token: string }> {
    const response = await axiosInstance.post<{
      data: { roomName: string; token: string };
    }>('/rooms/join', { identity, ...(name !== undefined ? { name } : {}) });

    return response.data.data;
  }
}

export const roomService = new RoomService();
