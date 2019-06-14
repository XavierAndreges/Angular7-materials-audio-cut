import { Injectable } from '@angular/core';
import { SerializedBuffer } from 'src/app/shared/models/types';
import { UtilsService } from 'src/app/shared/services/utils.service';

declare var Mp3LameEncoder: any;
Mp3LameEncoder.Mp3LameEncoderConfig = {
  memoryInitializerPrefixURL: '/assets/',
  TOTAL_MEMORY: 1073741824,
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(
    private utilsService: UtilsService
  ) {

    

   }


  public sliceAudioBuffer (
    audioBuffer: AudioBuffer, 
    start: number = 0, 
    end: number = audioBuffer.length): AudioBuffer {

    console.log("XXX AudioService -> sliceAudioBuffer() : audioBuffer / start /  end ", audioBuffer, start, end);

    const newBuffer = new AudioContext().createBuffer(
      audioBuffer.numberOfChannels,
      end - start,
      audioBuffer.sampleRate
    ) 
    for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
      newBuffer.copyToChannel(audioBuffer.getChannelData(i).slice(start, end), i)
    }

    console.log("XXX AudioService -> sliceAudioBuffer() : newBuffer", newBuffer);

    return newBuffer
  }


  public encode (audioBuffer: AudioBuffer, type: string) : Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audioData = this.serializeAudioBuffer(audioBuffer);
      console.log("XXX AudioService -> encode() : audioData", audioData);
      var data: Blob;
      if (type === "mp3") {
        data = this.encodeAudioBufferLame(audioData);
      } else {
        data = this.encodeAudioBufferWav(audioData);
      }
      
      resolve(data);
    })
  }


  public encodeAudioBufferLame (buffer: SerializedBuffer): Blob {

    console.log("XXX AudioService -> encodeAudioBufferLame() : buffer.channels", buffer.channels);
    const encoder = new Mp3LameEncoder(buffer.sampleRate, 192)
    encoder.encode(buffer.channels)
  
    const blob = encoder.finish()
    console.log("XXX AudioService -> encodeAudioBufferLame() : blob", blob);

    return blob
  }


  public serializeAudioBuffer (audioBuffer): SerializedBuffer {
    var buffer = {
      channels: this.utilsService.range(0, audioBuffer.numberOfChannels - 1)
        .map(i => audioBuffer.getChannelData(i)),
      sampleRate: audioBuffer.sampleRate,
      length: audioBuffer.length,
    }
    console.log("XXX AudioService -> serializeAudioBuffer() : serializeAudioBuffer", buffer);
    return buffer;
  }


  public encodeAudioBufferWav (buffer: SerializedBuffer): Blob {
    const interleaved = this.interleave(buffer.channels)
    const dataview = this.encodeWAV(interleaved, buffer.channels.length, buffer.sampleRate)
  
    return new Blob([dataview], { type: 'audio/wav' })
  }


    /**
  * @param {[Float32Array, Float32Array]} inputs
  */
  public interleave (inputs) {
    if (inputs.length === 1) {
      return inputs[0]
    } else {
      const inputL = inputs[0]
      const inputR = inputs[1]
      const length = inputL.length + inputR.length
      const result = new Float32Array(length)

      let index = 0
      let inputIndex = 0

      while (index < length) {
        result[index++] = inputL[inputIndex]
        result[index++] = inputR[inputIndex]
        inputIndex++
      }
      return result
    }
  }

  /**
   * @param {DataView} view
   * @param {number} offset
   * @param {Float32Array} input
   */
  public floatTo16BitPCM (view, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = input[i]

      if (s < 0) {
        if (s < -1) s = -1
        s *= 0x8000
      } else {
        if (s > 1) s = 1
        s *= 0x7FFF
      }

      view.setInt16(offset, s, true)
    }
  }

  /**
   * @param {DataView} view
   * @param {number} offset
   * @param {string} string
   */
  public writeString (view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  /**
   * @param {Float32Array} samples
   * @param {number} numChannels
   */
  public encodeWAV (samples, numChannels, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true)
    /* RIFF type */
    this.writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, 1, true)
    /* channel count */
    view.setUint16(22, numChannels, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true)
    /* bits per sample */
    view.setUint16(34, 16, true)
    /* data chunk identifier */
    this.writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true)

    this.floatTo16BitPCM(view, 44, samples)

    return view
  }

}
