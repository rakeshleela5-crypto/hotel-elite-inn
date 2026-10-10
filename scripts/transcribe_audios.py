import sys
import os
from faster_whisper import WhisperModel

def transcribe(audio_path, model_size="base"):
    print(f"Loading WhisperModel({model_size})...")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    print(f"Transcribing {audio_path}...")
    segments, info = model.transcribe(audio_path, beam_size=5)
    
    print(f"Detected language '{info.language}' with probability {info.language_probability:.2f}")
    print(f"Duration: {info.duration:.2f}s")
    print("-" * 50)
    
    full_text = []
    for segment in segments:
        line = f"[{segment.start:.1f}s -> {segment.end:.1f}s] {segment.text}"
        print(line)
        full_text.append(line)
        
    return "\n".join(full_text)

if __name__ == "__main__":
    audio = sys.argv[1] if len(sys.argv) > 1 else r"c:\Users\rakes\Downloads\2026_10_03_14_54_01_1.mp3"
    transcribe(audio)
