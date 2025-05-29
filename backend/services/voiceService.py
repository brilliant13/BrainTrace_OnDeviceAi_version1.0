import subprocess
import tempfile
from transformers import pipeline
import torch
import librosa
import logging
import os

def transcribe(audio_path: str) -> str:
    try:
        logging.info(f"[Transcribe] 시작: {audio_path}")
        device = 0 if torch.cuda.is_available() else -1

        # Whisper pipeline
        asr = pipeline(
            "automatic-speech-recognition",
            model="o0dimplz0o/Fine-Tuned-Whisper-Large-v2-Zeroth-STT-KO",
            device=device,
            chunk_length_s=30,
            stride_length_s=5,
            return_timestamps=False,
            generate_kwargs={"language": "ko"}
        )

        # webm/mp3 → wav 변환
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
            wav_path = tmp_wav.name

        command = [
            "ffmpeg",
            "-y", "-i", audio_path,
            "-ar", "16000", "-ac", "1", wav_path
        ]


        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        logging.info(f"[ffmpeg 변환 완료] {wav_path}")


        # librosa로 로딩
        waveform, _ = librosa.load(wav_path, sr=16000)
        logging.info(f"[Waveform 로딩 완료] 길이: {len(waveform)}")

        result = asr({"array": waveform, "sampling_rate": 16000})
        
        # wav 파일 삭제
        os.unlink(wav_path)

        return result["text"]

    except subprocess.CalledProcessError as e:
        logging.exception("ffmpeg 변환 실패")
        raise Exception(f"ffmpeg 변환 실패: {e}")
    except Exception as e:
        logging.exception("transcribe 함수 오류")
        raise Exception(f"음성 변환 실패: {str(e)}")
