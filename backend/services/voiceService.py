from transformers import pipeline
import torch
import librosa
import logging


def transcribe(audio_path: str) -> str:
    """
    Whisper 한국어 파인튜닝 모델을 사용해 오디오를 높은 정확도로 전사합니다.
    - librosa로 16kHz waveform 로딩
    - waveform만 pipeline에 전달
    """
    try:
        device = 0 if torch.cuda.is_available() else -1

        asr = pipeline(
            "automatic-speech-recognition",
            model="o0dimplz0o/Fine-Tuned-Whisper-Large-v2-Zeroth-STT-KO",
            device=device,
            chunk_length_s=30,
            stride_length_s=5,
            return_timestamps=False,
            generate_kwargs={"language": "ko"}
        )

        # librosa로 mp3를 16kHz waveform으로 로딩
        waveform, _ = librosa.load(audio_path, sr=16000)
        result = asr({"array": waveform, "sampling_rate": 16000})
        return result["text"]
    except Exception as e:
        logging.error(f"음성 변환 중 오류 발생: {str(e)}")
        raise Exception(f"음성 변환 실패: {str(e)}")
