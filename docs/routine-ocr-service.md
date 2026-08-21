# StudySync Routine OCR service contract

StudySync does not run Unlimited-OCR in the browser. The Vite client sends an uploaded document to a separately deployed, authenticated adapter. The adapter validates the file again, converts PDF pages to images, invokes Baidu Unlimited-OCR with structured document/table parsing, normalizes the model output, deletes temporary files, and returns JSON.

The upstream project is MIT-licensed: <https://github.com/baidu/Unlimited-OCR>. Its current documentation supports NVIDIA GPU inference through Transformers and OpenAI-compatible vLLM/SGLang deployments. PDF examples use PyMuPDF to rasterize pages before multi-image parsing.

## Endpoint

`POST /api/routine-ocr/extract`

Request: `multipart/form-data`

- `file`: required PDF, PNG, JPEG, or WEBP.
- `includedPages`: optional JSON array of one-based page numbers.

The server must enforce its own MIME/signature checks, size/page limits, request authentication, timeout, and temporary-file cleanup. It must not return Python traces, local paths, credentials, model output markup, or retained-document URLs.

## Response

```json
{
  "importId": "uuid",
  "sourceFile": { "name": "routine.pdf", "type": "application/pdf", "pageCount": 2 },
  "detectedGroups": ["A1", "A2", "B1", "B2"],
  "courses": [
    {
      "tempId": "uuid",
      "courseId": "CSE 321",
      "title": "Database Systems",
      "credit": 3,
      "teacherName": "Dr. Example Teacher",
      "courseType": "theory",
      "confidence": 0.94,
      "sourcePage": 1,
      "sourceText": "original OCR row text"
    }
  ],
  "routineEntries": [
    {
      "tempId": "uuid",
      "day": "Sunday",
      "startTime": "09:00",
      "endTime": "10:30",
      "courseId": "CSE 321",
      "courseTitle": "Database Systems",
      "teacherName": "Dr. Example Teacher",
      "credit": 3,
      "group": "B2",
      "section": "B",
      "room": "B-302",
      "building": "Academic Building",
      "classType": "theory",
      "isCommon": false,
      "confidence": 0.91,
      "sourcePage": 1,
      "sourceText": "original OCR row text"
    }
  ],
  "warnings": [],
  "rawTextReference": null
}
```

The adapter must exclude class-test, assignment, and examination schedules. The frontend validates and filters them again, treats every field as untrusted text, and requires review before import.

## Deployment still required

- Python 3.12 service with file validation and multipart handling.
- NVIDIA GPU runtime compatible with the selected official Transformers, vLLM, or SGLang path.
- Unlimited-OCR model weights and their applicable distribution terms.
- PyMuPDF or an equivalent sandboxed PDF rasterizer.
- Authenticated HTTPS routing, rate limits, observability, timeouts, and temporary-file deletion.
- Backend tests using representative CUET routine scans; no model credentials belong in `VITE_*` variables.
