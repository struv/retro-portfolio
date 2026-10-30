"""Regenerate the original demo loops. Python standard library only; no samples."""
from array import array
from pathlib import Path
import math
import random
import wave

RATE = 22050
TAU = math.tau
OUT = Path(__file__).parent


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def render(name, bpm, roots, melody, flavor, seed):
    duration = 32 * 60 / bpm
    length = round(duration * RATE)
    data = array('d', [0.0]) * length
    beat = 60 / bpm
    rng = random.Random(seed)

    def tone(start, seconds, midi, gain, kind='pad'):
        freq = frequency(midi)
        n = round(seconds * RATE)
        at = round(start * RATE)
        attack = .12 if kind == 'pad' else .015
        release = .35 if kind == 'pad' else .10
        for i in range(n):
            t = i / RATE
            phase = TAU * freq * t
            envelope = min(1, t / attack, (seconds - t) / release)
            if kind == 'pad':
                sample = (math.sin(phase) + .22 * math.sin(phase * 2)
                          + .10 * math.sin(phase * 3))
                envelope *= .75 + .25 * math.sin(math.pi * t / seconds)
            elif kind == 'bass':
                sample = math.sin(phase) + .16 * math.sin(phase * 2)
                envelope *= math.exp(-1.5 * t / seconds)
            else:
                sample = math.sin(phase) + .24 * math.sin(phase * 2) + .08 * math.sin(phase * 4)
                envelope *= math.exp(-3.5 * t / seconds)
            data[(at + i) % length] += gain * max(0, envelope) * sample

    def drum(start, kind, gain):
        seconds = {'kick': .24, 'hat': .065, 'snare': .15}[kind]
        n = round(seconds * RATE)
        at = round(start * RATE)
        previous = 0
        for i in range(n):
            t = i / RATE
            noise = rng.uniform(-1, 1)
            if kind == 'kick':
                phase = TAU * (48 * t + 18 * .025 * (1 - math.exp(-t / .025)))
                value = math.sin(phase) * math.exp(-t * 18)
            elif kind == 'hat':
                value = (noise - previous) * math.exp(-t * 65)
            else:
                value = (.7 * noise + .3 * math.sin(TAU * 180 * t)) * math.exp(-t * 32)
            previous = noise
            data[(at + i) % length] += gain * value * min(1, t / .002)

    for bar in range(8):
        root = roots[bar % 4]
        start = bar * beat * 4
        # Four related seventh chords, with open voicing and a warm sine bass.
        intervals = [0, 3, 7, 10] if bar % 4 in [0, 3] else [0, 4, 7, 11]
        for interval in intervals:
            tone(start, beat * 4.4, root + interval + 12, .048, 'pad')
        for slot in [0, 1.5, 2.75]:
            tone(start + beat * slot, beat * .95, root - 12, .14, 'bass')
        for slot in range(4):
            note = melody[(bar * 4 + slot) % len(melody)]
            when = start + beat * (slot + (.5 if bar % 2 else .25))
            tone(when, beat * (1.6 if flavor == 'ambient' else .8), note, .105, 'bell')
            tone(when + beat * .75, beat * .85, note, .032, 'bell')
        if flavor != 'ambient':
            kicks = [0, 1.5, 2.75] if flavor == 'broken' else [0, 1, 2, 3] if flavor == 'night' else [0, 2]
            for slot in kicks:
                drum(start + beat * slot, 'kick', .27)
            for slot in [1, 3]:
                drum(start + beat * slot, 'snare', .045)
            for slot in range(8):
                drum(start + beat * slot / 2, 'hat', .022 if slot % 2 else .014)
        else:
            drum(start, 'kick', .14)
            for slot in [1.5, 3.5]:
                drum(start + beat * slot, 'hat', .012)

    peak = max(abs(x) for x in data)
    scale = .80 / peak
    pcm = array('h')
    fade = round(.008 * RATE)
    for i, value in enumerate(data):
        edge = min(1, i / fade, (length - 1 - i) / fade)
        pcm.append(round(value * scale * edge * 32767))
    import sys
    if sys.byteorder != 'little':
        pcm.byteswap()
    with wave.open(str(OUT / (name + '.wav')), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(RATE)
        audio.writeframes(pcm.tobytes())
    print(f'{name}: {length / RATE:.3f}s; peak {max(abs(x) for x in pcm) / 32767:.3f}; {len(pcm) * 2:,} PCM bytes')


if __name__ == '__main__':
    render('orbital', 92, [45, 48, 41, 43], [69, 76, 72, 79, 76, 72, 67, 64], 'ambient', 1)
    render('afterglow', 96, [50, 53, 46, 48], [74, 81, 77, 76, 72, 77, 69, 65], 'beat', 2)
    render('soft-signal', 88, [47, 50, 43, 45], [71, 66, 74, 78, 69, 66, 74, 73], 'broken', 3)
    render('velvet-tide', 90, [44, 47, 40, 42], [68, 75, 71, 78, 70, 75, 66, 63], 'ambient', 4)
    render('night-drive', 94, [49, 52, 45, 47], [73, 80, 76, 71, 68, 76, 80, 83], 'night', 5)
