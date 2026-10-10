import sys
import subprocess
import os
import json
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')

AUDIO_PATH = r"c:\Users\rakes\Downloads\Telegram Desktop\2026_10_03_15_59_51_1 (2).mp3"
SAMPLE_DIR = "scratch/audio4_samples"
os.makedirs(SAMPLE_DIR, exist_ok=True)

# Sample intervals in seconds: 0, 300, 600, 900, 1200, 1500, 1800, 2400, 3000, 3600, 4200, 4800, 5400
INTERVALS = [0, 300, 600, 900, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400]
SAMPLE_DURATION = 90 # 90 seconds sample each

print("Extracting audio samples...")
sample_files = []
for start in INTERVALS:
    mins = start // 60
    out_file = os.path.join(SAMPLE_DIR, f"sample_{mins:02d}min.wav")
    if not os.path.exists(out_file):
        cmd = [
            "ffmpeg", "-y", "-ss", str(start), "-t", str(SAMPLE_DURATION),
            "-i", AUDIO_PATH, "-ac", "1", "-ar", "16000", out_file
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sample_files.append((start, mins, out_file))

print("Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")

results = []
for start, mins, s_file in sample_files:
    print(f"\n--- Transcribing Sample at {mins} min (offset {start}s) ---")
    segments, info = model.transcribe(s_file, beam_size=5, condition_on_previous_text=False)
    lines = []
    for s in segments:
        t = s.text.strip()
        if t:
            lines.append(f"[{s.start:.1f}s -> {s.end:.1f}s] {t}")
            
    # Also translate to English
    tr_lines = []
    if info.language != "en":
        tr_segments, _ = model.transcribe(s_file, task="translate", beam_size=5, condition_on_previous_text=False)
        for s in tr_segments:
            t = s.text.strip()
            if t:
                tr_lines.append(f"[{s.start:.1f}s -> {s.end:.1f}s] {t}")
                
    sample_res = {
        "minute": mins,
        "offset_sec": start,
        "lang": info.language,
        "text": lines,
        "translation": tr_lines
    }
    results.append(sample_res)
    print(f"Language: {info.language}")
    print("Translation excerpt:")
    for l in tr_lines[:4]:
        print("  ", l)

with open("scratch/audio4_overview.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nSampling complete! Saved to scratch/audio4_overview.json")
