from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
from mistralai.client import MistralClient
import os
import base64
import requests

router = APIRouter()

mistral_client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))

def process_document_with_mistral(file_bytes: bytes, file_type: str, document_type: str) -> str:
    """Process document using Mistral AI's OCR capabilities"""
    # Convert file bytes to base64
    file_content = base64.b64encode(file_bytes).decode('utf-8')
    
    # Prepare the OCR request payload
    payload = {
        "model": "mistral-ocr-latest",
        "document": {
            "type": "document_url",
            "document_url": f"data:{file_type};base64,{file_content}",
            "document_name": document_type
        },
        "include_image_base64": False  # We don't need the images returned
    }
    
    # Make request to Mistral OCR API
    response = requests.post(
        "https://api.mistral.ai/v1/ocr",
        headers={
            "Authorization": f"Bearer {os.getenv('MISTRAL_API_KEY')}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Mistral OCR API error: {response.text}"
        )
    
    # Extract text from OCR response
    ocr_result = response.json()
    text = ""
    for page in ocr_result["pages"]:
        text += page["markdown"] + "\n\n"
    
    return text.strip()

@router.post("/process-document")
async def process_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = None
):
    """Process uploaded documents using Mistral AI's OCR"""
    try:
        content = await file.read()
        
        # Get file type
        file_type = file.content_type or "application/octet-stream"
        
        # Process document with Mistral OCR
        formatted_text = process_document_with_mistral(
            content,
            file_type,
            document_type or "document"
        )
        
        word_count = len(formatted_text.split())
        
        return {
            "text": formatted_text,
            "word_count": word_count,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 