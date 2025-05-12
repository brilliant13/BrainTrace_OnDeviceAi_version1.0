from langchain.text_splitter import RecursiveCharacterTextSplitter
import logging

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    텍스트를 청크로 분할합니다.
    
    Args:
        text (str): 분할할 텍스트
        chunk_size (int): 각 청크의 최대 크기 (기본값: 1000)
        chunk_overlap (int): 청크 간 겹치는 부분의 크기 (기본값: 200)
    
    Returns:
        list[str]: 분할된 텍스트 청크 리스트
    """
    try:
        print("start chunking")
        # RecursiveCharacterTextSplitter 초기화
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        
        # 텍스트 분할
        chunks = text_splitter.split_text(text)
        logging.info(f"✅ 텍스트가 {len(chunks)}개의 청크로 분할되었습니다.")
        return chunks
    except Exception as e:
        logging.error(f"❌ 텍스트 청킹 중 오류 발생: {str(e)}")
        raise RuntimeError("텍스트 청킹 중 오류가 발생했습니다.") 