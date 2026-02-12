import io
import json
import os
from pathlib import Path
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms
from torchvision.models import resnet18

# Get the directory where this script is located
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model" / "grievance_classifier.pth"
CLASS_MAP_PATH = BASE_DIR / "model" / "class_mapping.json"

# Load class mapping
print("[INFO] Loading class mapping from:", str(CLASS_MAP_PATH))
try:
    with open(CLASS_MAP_PATH, "r") as f:
        raw_map = json.load(f)
    # raw_map is label -> index; we need index -> label
    idx_to_class = {int(v): k for k, v in raw_map.items()}
    print(f"[SUCCESS] Loaded {len(idx_to_class)} classes: {list(raw_map.keys())}")
except Exception as e:
    print(f"[ERROR] Error loading class mapping: {e}")
    raise

# Load model
print(f"[INFO] Loading model from: {MODEL_PATH}")
try:
    num_classes = len(idx_to_class)
    model = resnet18(num_classes=num_classes)
    model.load_state_dict(torch.load(str(MODEL_PATH), map_location="cpu"))
    model.eval()
    print("[SUCCESS] Model loaded successfully")
except Exception as e:
    print(f"[ERROR] Error loading model: {e}")
    raise

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Inference service is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        print(f"[INFO] Received prediction request for file: {file.filename}")
        
        # Read image
        image_data = await file.read()
        print(f"[INFO] Image size: {len(image_data)} bytes")
        
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        print(f"[INFO] Image dimensions: {img.size}")
        
        # Preprocess
        x = preprocess(img).unsqueeze(0)
        
        # Predict
        with torch.no_grad():
            logits = model(x)
            probs = F.softmax(logits, dim=1)[0]
            conf, idx = torch.max(probs, dim=0)
        
        label = idx_to_class[int(idx)]
        confidence = float(conf)
        
        print(f"[SUCCESS] Prediction: {label} (confidence: {confidence:.4f})")
        
        return {"label": label, "confidence": confidence}
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Prediction error: {error_msg}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500, 
            content={"error": error_msg, "type": type(e).__name__}
        )