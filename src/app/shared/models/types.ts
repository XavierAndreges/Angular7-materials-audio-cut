export class AudioFile {
    "id": number;
    "name": string;
    "file": File;
    "arrayBuffer": ArrayBuffer;
    "regionStart": number;
    "regionEnd": number;
    "seek": number;
    "minPxPerSec": number;

    constructor(id, name) {
      this.id = id;
      this.name = name;
      this.file = null;
      this.arrayBuffer = null;
      this.regionStart = null;
      this.regionEnd = null;
      this.seek = null;
      this.minPxPerSec = null;
    }
  }

export interface UserNamePassword {
  userName: string;
  password: string;
}

export interface SerializedBuffer {
    channels: any,
    sampleRate: number,
    length: number
}
