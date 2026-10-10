import sys
import os
import json
from faster_whisper import WhisperModel

# Ensure utf-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

def transcribe_file(model, audio_path, out_txt_path):
    print(f"\n==================================================")
    print(f"Transcribing: {audio_path}")
    print(f"Output to: {out_txt_path}")
    print(f"==================================================")
    
    # Run transcription in original language
    segments, info = model.transcribe(audio_path, beam_size=5, condition_on_previous_text=False)
    
    print(f"Detected language '{info.language}' with probability {info.language_probability:.2f}")
    print(f"Duration: {info.duration:.2f}s")
    
    orig_lines = []
    for s in segments:
        text = s.text.strip()
        if text:
            orig_lines.append(f"[{s.start:.1f}s -> {s.end:.1f}s] {text}")
            print(f"[{s.start:.1f}s -> {s.end:.1f}s] {text}")

    # Also run translation to English if detected language is not English
    trans_lines = []
    if info.language != "en":
        print(f"\n--- English Translation ---")
        tr_segments, _ = model.transcribe(audio_path, task="translate", beam_size=5, condition_on_previous_text=False)
        for s in tr_segments:
            text = s.text.strip()
            if text:
                trans_lines.append(f"[{s.start:.1f}s -> {s.end:.1f}s] {text}")
                print(f"[{s.start:.1f}s -> {s.end:.1f}s] {text}")

    output_data = {
        "audio_path": audio_path,
        "language": info.language,
        "language_prob": info.language_probability,
        "duration": info.duration,
        "original_transcript": orig_lines,
        "english_translation": trans_lines
    }
    
    with open(out_txt_path, "w", encoding="utf-8") as f:
        f.write(f"AUDIO FILE: {audio_path}\n")
        f.write(f"DETECTED LANGUAGE: {info.language} (p={info.language_probability:.2f})\n")
        f.write(f"DURATION: {info.duration:.2f}s\n\n")
        f.write("=== ORIGINAL TRANSCRIPT ===\n")
        f.write("\n".join(orig_lines))
        if trans_lines:
            f.write("\n\n=== ENGLISH TRANSLATION ===\n")
            f.write("\n".join(trans_lines))
        f.write("\n")
        
    out_json = out_txt_path.replace(".txt", ".json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

def main():
    files = [
        (r"c:\Users\rakes\Downloads\2026_10_03_14_54_01_1.mp3", "scratch/transcript_1_14_54.txt"),
        (r"c:\Users\rakes\Downloads\Telegram Desktop\2026_10_03_15_02_49_1 (2).mp3", "scratch/transcript_2_15_02.txt"),
        (r"c:\Users\rakes\Downloads\Telegram Desktop\2026_10_03_15_06_12_1 (2).mp3", "scratch/transcript_3_15_06.txt"),
    ]
    
    # If a specific index is given
    target = int(sys.argv[1]) if len(sys.argv) > 1 else None
    
    print("Loading WhisperModel('base')...")
    model = WhisperModel("base", device="cpu", compute_type="int8")
    
    if target is not None:
        if target == 4:
            f_path = r"c:\Users\rakes\Downloads\Telegram Desktop\2026_10_03_15_59_51_1 (2).mp3"
            out_p = "scratch/transcript_4_15_59.txt"
            transcribe_file(model, f_path, out_p)
        else:
            f_path, out_p = files[target - 1]
            transcribe_file(model, f_path, out_p)
    else:
        for f_path, out_p in files:
            transcribe_file(model, f_path, out_p)

if __name__ == "__main__":
    main()
