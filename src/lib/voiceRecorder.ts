/**
 * Record microphone to WAV and return as Blob for backend speech_recognition.
 * Uses AudioContext + ScriptProcessor to capture 16-bit PCM and build WAV.
 */

const SAMPLE_RATE = 16000;

function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

function buildWavBlob(pcm: Int16Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const pcmView = new Int16Array(buffer, 44, pcm.length);
  pcmView.set(pcm);
  return new Blob([buffer], { type: "audio/wav" });
}

export interface WavRecorder {
  stop: () => Promise<Blob>;
}

/**
 * Start recording from the microphone. Returns a handle to stop and get the WAV Blob.
 * Uses 16 kHz mono for speech recognition.
 */
export function startWavRecording(): Promise<WavRecorder> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
        const source = ctx.createMediaStreamSource(stream);
        const bufferSize = 4096;
        const chunks: Int16Array[] = [];

        const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
        processor.onaudioprocess = (e: AudioProcessingEvent) => {
          const input = e.inputBuffer.getChannelData(0);
          chunks.push(floatTo16BitPCM(input));
        };
        const dest = ctx.createMediaStreamDestination();
        source.connect(processor);
        processor.connect(dest);

        const stop = (): Promise<Blob> =>
          new Promise((res) => {
            processor.disconnect();
            source.disconnect();
            stream.getTracks().forEach((t) => t.stop());
            const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
            const pcm = new Int16Array(totalLength);
            let offset = 0;
            for (const c of chunks) {
              pcm.set(c, offset);
              offset += c.length;
            }
            const blob = buildWavBlob(pcm, ctx.sampleRate);
            res(blob);
          });

        // Resume context so recording actually starts (required in modern browsers)
        if (ctx.state === "suspended") {
          ctx.resume().then(() => resolve({ stop })).catch(reject);
        } else {
          resolve({ stop });
        }
      })
      .catch(reject);
  });
}
