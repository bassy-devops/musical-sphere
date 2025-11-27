import * as Tone from 'tone';

class AudioEngine {
    private synth: Tone.PolySynth;
    private recorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private dest: MediaStreamAudioDestinationNode;
    private noteCallbacks: ((note: string) => void)[] = [];

    constructor() {
        const context = Tone.getContext().rawContext as AudioContext;
        this.dest = context.createMediaStreamDestination();

        this.synth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 10,
            detune: 0,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.1,
                release: 1.2
            },
            modulation: {
                type: "square"
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0,
                sustain: 1,
                release: 0.5
            }
        }).toDestination();

        // Connect to recorder destination as well
        this.synth.connect(this.dest);
    }

    async start() {
        await Tone.start();
    }

    getNote(size: number, speed: number): string {
        const scale = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6"];
        const sizeIndex = Math.floor((1.5 - size) * 10);
        const speedOffset = Math.floor(speed);
        const index = Math.max(0, Math.min(scale.length - 1, sizeIndex + speedOffset));
        return scale[index];
    }

    triggerNote(size: number, speed: number) {
        const note = this.getNote(size, speed);
        this.synth.triggerAttackRelease(note, "8n");
    }

    startNote(size: number, speed: number): string {
        const note = this.getNote(size, speed);
        this.synth.triggerAttack(note);
        return note;
    }

    stopNote(note: string) {
        this.synth.triggerRelease(note);
    }

    startRecording() {
        this.chunks = [];
        const stream = this.dest.stream;
        this.recorder = new MediaRecorder(stream);

        this.recorder.ondataavailable = (evt) => {
            this.chunks.push(evt.data);
        };

        this.recorder.start();
    }

    stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.recorder) {
                reject("No recorder");
                return;
            }

            this.recorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'audio/webm' });
                resolve(blob);
            };

            this.recorder.stop();
        });
    }

    onNoteTrigger(callback: (note: string) => void) {
        this.noteCallbacks.push(callback);
    }

    playMelody(melody: { note: string; duration: string; time: number }[]) {
        // Stop previous
        Tone.Transport.stop();
        Tone.Transport.cancel();

        new Tone.Part((time, value) => {
            this.synth.triggerAttackRelease(value.note, value.duration, time);

            // Notify listeners (Scene) to pop a sphere
            Tone.Draw.schedule(() => {
                this.noteCallbacks.forEach(cb => cb(value.note));
            }, time);
        }, melody).start(0);

        Tone.Transport.start();
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }
}

export const audioEngine = new AudioEngine();

export const SONGS = {
    twinkle: [
        // Part 1
        { note: "C4", duration: "4n", time: 0 }, { note: "C4", duration: "4n", time: 0.5 },
        { note: "G4", duration: "4n", time: 1 }, { note: "G4", duration: "4n", time: 1.5 },
        { note: "A4", duration: "4n", time: 2 }, { note: "A4", duration: "4n", time: 2.5 },
        { note: "G4", duration: "2n", time: 3 },
        { note: "F4", duration: "4n", time: 4 }, { note: "F4", duration: "4n", time: 4.5 },
        { note: "E4", duration: "4n", time: 5 }, { note: "E4", duration: "4n", time: 5.5 },
        { note: "D4", duration: "4n", time: 6 }, { note: "D4", duration: "4n", time: 6.5 },
        { note: "C4", duration: "2n", time: 7 },
        // Part 2
        { note: "G4", duration: "4n", time: 8 }, { note: "G4", duration: "4n", time: 8.5 },
        { note: "F4", duration: "4n", time: 9 }, { note: "F4", duration: "4n", time: 9.5 },
        { note: "E4", duration: "4n", time: 10 }, { note: "E4", duration: "4n", time: 10.5 },
        { note: "D4", duration: "2n", time: 11 },
        // Part 3
        { note: "G4", duration: "4n", time: 12 }, { note: "G4", duration: "4n", time: 12.5 },
        { note: "F4", duration: "4n", time: 13 }, { note: "F4", duration: "4n", time: 13.5 },
        { note: "E4", duration: "4n", time: 14 }, { note: "E4", duration: "4n", time: 14.5 },
        { note: "D4", duration: "2n", time: 15 },
        // Part 4 (Repeat Part 1)
        { note: "C4", duration: "4n", time: 16 }, { note: "C4", duration: "4n", time: 16.5 },
        { note: "G4", duration: "4n", time: 17 }, { note: "G4", duration: "4n", time: 17.5 },
        { note: "A4", duration: "4n", time: 18 }, { note: "A4", duration: "4n", time: 18.5 },
        { note: "G4", duration: "2n", time: 19 },
        { note: "F4", duration: "4n", time: 20 }, { note: "F4", duration: "4n", time: 20.5 },
        { note: "E4", duration: "4n", time: 21 }, { note: "E4", duration: "4n", time: 21.5 },
        { note: "D4", duration: "4n", time: 22 }, { note: "D4", duration: "4n", time: 22.5 },
        { note: "C4", duration: "2n", time: 23 },
    ],
    ode: [
        // Part 1
        { note: "E4", duration: "4n", time: 0 }, { note: "E4", duration: "4n", time: 0.5 },
        { note: "F4", duration: "4n", time: 1 }, { note: "G4", duration: "4n", time: 1.5 },
        { note: "G4", duration: "4n", time: 2 }, { note: "F4", duration: "4n", time: 2.5 },
        { note: "E4", duration: "4n", time: 3 }, { note: "D4", duration: "4n", time: 3.5 },
        { note: "C4", duration: "4n", time: 4 }, { note: "C4", duration: "4n", time: 4.5 },
        { note: "D4", duration: "4n", time: 5 }, { note: "E4", duration: "4n", time: 5.5 },
        { note: "E4", duration: "4n", time: 6 }, { note: "D4", duration: "8n", time: 6.5 },
        { note: "D4", duration: "2n", time: 6.75 },
        // Part 2
        { note: "E4", duration: "4n", time: 8 }, { note: "E4", duration: "4n", time: 8.5 },
        { note: "F4", duration: "4n", time: 9 }, { note: "G4", duration: "4n", time: 9.5 },
        { note: "G4", duration: "4n", time: 10 }, { note: "F4", duration: "4n", time: 10.5 },
        { note: "E4", duration: "4n", time: 11 }, { note: "D4", duration: "4n", time: 11.5 },
        { note: "C4", duration: "4n", time: 12 }, { note: "C4", duration: "4n", time: 12.5 },
        { note: "D4", duration: "4n", time: 13 }, { note: "E4", duration: "4n", time: 13.5 },
        { note: "D4", duration: "4n", time: 14 }, { note: "C4", duration: "8n", time: 14.5 },
        { note: "C4", duration: "2n", time: 14.75 },
        // Part 3
        { note: "D4", duration: "4n", time: 16 }, { note: "D4", duration: "4n", time: 16.5 },
        { note: "E4", duration: "4n", time: 17 }, { note: "C4", duration: "4n", time: 17.5 },
        { note: "D4", duration: "4n", time: 18 }, { note: "E4", duration: "8n", time: 18.5 },
        { note: "F4", duration: "8n", time: 18.75 },
        { note: "E4", duration: "4n", time: 19 }, { note: "C4", duration: "4n", time: 19.5 },
        { note: "D4", duration: "4n", time: 20 }, { note: "E4", duration: "8n", time: 20.5 },
        { note: "F4", duration: "8n", time: 20.75 },
        { note: "E4", duration: "4n", time: 21 }, { note: "D4", duration: "4n", time: 21.5 },
        { note: "C4", duration: "4n", time: 22 }, { note: "D4", duration: "4n", time: 22.5 },
        { note: "G3", duration: "2n", time: 23 },
        // Part 4 (Repeat Part 2)
        { note: "E4", duration: "4n", time: 24 }, { note: "E4", duration: "4n", time: 24.5 },
        { note: "F4", duration: "4n", time: 25 }, { note: "G4", duration: "4n", time: 25.5 },
        { note: "G4", duration: "4n", time: 26 }, { note: "F4", duration: "4n", time: 26.5 },
        { note: "E4", duration: "4n", time: 27 }, { note: "D4", duration: "4n", time: 27.5 },
        { note: "C4", duration: "4n", time: 28 }, { note: "C4", duration: "4n", time: 28.5 },
        { note: "D4", duration: "4n", time: 29 }, { note: "E4", duration: "4n", time: 29.5 },
        { note: "D4", duration: "4n", time: 30 }, { note: "C4", duration: "8n", time: 30.5 },
        { note: "C4", duration: "2n", time: 30.75 },
    ]
};
