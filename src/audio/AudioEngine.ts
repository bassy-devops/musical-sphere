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
            harmonicity: 3.01,
            modulationIndex: 10,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.001,
                decay: 1.0,
                sustain: 0.1,
                release: 1.0
            },
            modulation: {
                type: "square"
            },
            modulationEnvelope: {
                attack: 0.002,
                decay: 0.2,
                sustain: 0,
                release: 0.2
            }
        }).connect(this.dest);

        // Add some reverb for that spacey handpan feel
        const reverb = new Tone.Reverb({
            decay: 2.5,
            preDelay: 0.1,
            wet: 0.3
        }).toDestination();

        this.synth.connect(reverb);
    }

    async start() {
        await Tone.start();
    }

    getNote(color: string): string {
        const map: Record<string, string> = {
            "#FFB7B2": "C4", // Pink
            "#FFB347": "D4", // Orange
            "#FDFD96": "E4", // Yellow
            "#77DD77": "F4", // Green
            "#AEC6CF": "G4", // Blue
            "#C3B1E1": "A4", // Purple
        };
        return map[color] || "C4";
    }

    triggerNote(color: string) {
        const note = this.getNote(color);
        this.synth.triggerAttackRelease(note, "8n");
    }

    startNote(color: string): string {
        const note = this.getNote(color);
        // Limit duration to max 1 second even if held
        this.synth.triggerAttackRelease(note, "1s");
        return note;
    }

    stopNote(note: string) {
        // Release immediately if button is released before 2s
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
