//Video state
export interface VideoState {
    url: string;
    isPlaying: boolean;
    currentTime: number;
    playbackRate: number;
    lastUpdated: number;
}

//A member of room
export interface RoomMember {
    socketId: string;
    username: string;
    joinedAt: number;
}

//Room
export interface Room {
    id: string;
    name: string;
    hostId: string;
    members: Map<string, RoomMember>;
    videoState: VideoState;
    createdAt: number;
}

//Create Room
export interface CreateRoomPayload {
    username: string;
    roomName: string;
    videoUrl?: string;
}

//Join Room
export interface JoinRoomPayload {
    username: string;
    roomId: string;
}

//Video state changes
export interface VideoStateChangePayload {
    roomId: string;
    isPlaying: string;
    currentTime: string;
    playbackRate?: number;
}

export interface SeekPayload{
    roomId: string;
    currentTime: number;
}

export interface ChangeVideoPayload{
    roomId: string;
    url: string;
}

export interface RoomStatePayload {
    roomId: string;
    roomName: string;
    hostId: string;
    members: RoomMember[];
    videoState: VideoState;
}

export interface UserJoinedPayload {
    user: RoomMember;
    memberCount: number;
}

export interface UserLeftPayload {
    socketId: string;
    username: string;
    memberCount: number;
    newHostId?: string;
}

export interface VideoSyncPayload {
    isPlaying: boolean;
    currentTime: number;
    playbackRate: number;
    updatedBy: string;
    timestamp: number;
}

export interface VideoChangedPayload {
    url: string;
    changedBy: string;
}

export interface ErrorPayload {
    message: string;
    code?: string;
}
