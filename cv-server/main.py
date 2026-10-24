from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import os
import cv2
import numpy as np
import base64
from PIL import Image

import torch
import torchvision.models as models
import torchvision.transforms as transforms

from ultralytics import YOLO

from sklearn.datasets import fetch_lfw_people
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.metrics import classification_report

app = FastAPI()

# Allow React to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/lab1-images")
async def process_lab1(
    file: UploadFile = File(...), 
    operation: str = Form(...)
):
    # 1. Read the uploaded image file into a NumPy array
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # 2. Execute the selected OpenCV operation based on the frontend request
    processed_img = img
    
    if operation == "grayscale":
        processed_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    elif operation == "crop":
        # Cropping a 200x200 ROI from coordinate 50,50
        processed_img = img[50:250, 50:250]
    elif operation == "resize":
        # Resizing to 300x300 pixels
        processed_img = cv2.resize(img, (300, 300))
    elif operation == "rotate":
        # Rotating 90 degrees clockwise
        processed_img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

    # 3. Encode the processed image back to Base64 to send to React
    # If the image is grayscale, cv2.imencode still works correctly
    _, buffer = cv2.imencode('.jpg', processed_img)
    encoded_string = base64.b64encode(buffer).decode('utf-8')
    
    return {"processed_image": f"data:image/jpeg;base64,{encoded_string}"}


@app.post("/api/lab2-edge-detection")
@app.post("/api/edge-detection")
async def process_lab2_edge_detection(
    file: UploadFile = File(...)
):
    # 1. Read uploaded image in grayscale
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img_gray = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

    if img_gray is None:
        return {"error": "Invalid image file uploaded."}

    # 2. Gaussian blur to suppress noise
    img_blur = cv2.GaussianBlur(img_gray, (3, 3), 0)

    # 3. Calculate Sobel gradient magnitude
    sobel_x = cv2.Sobel(img_blur, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(img_blur, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = cv2.magnitude(sobel_x, sobel_y)
    sobel_img = np.uint8(np.clip(magnitude, 0, 255))

    # 4. Calculate Canny edges
    canny_img = cv2.Canny(img_blur, 100, 200)

    # 5. Create 1x3 Matplotlib comparison grid (high-resolution wide layout)
    fig, axs = plt.subplots(1, 3, figsize=(18, 6))

    axs[0].imshow(img_gray, cmap='gray')
    axs[0].set_title("1. Original Image (Grayscale)", fontsize=13, fontweight='bold')
    axs[0].axis('off')

    axs[1].imshow(sobel_img, cmap='gray')
    axs[1].set_title("2. Sobel Edge Detection", fontsize=13, fontweight='bold')
    axs[1].axis('off')

    axs[2].imshow(canny_img, cmap='gray')
    axs[2].set_title("3. Canny Edge Detection", fontsize=13, fontweight='bold')
    axs[2].axis('off')

    plt.tight_layout()

    # 6. Encode figure to Base64 PNG
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=140)
    buf.seek(0)
    encoded_string = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    image_url = f"data:image/png;base64,{encoded_string}"

    return {
        "processed_image": image_url,
        "output_image": image_url
    }


@app.post("/api/lab3-histogram")
@app.post("/api/histogram")
async def process_lab3_histogram(
    file: UploadFile = File(...)
):
    # 1. Read uploaded image in grayscale
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        return {"error": "Invalid image file uploaded."}

    # 2. Apply Global Equalization and CLAHE
    global_img = cv2.equalizeHist(img)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_img = clahe.apply(img)

    # 3. Calculate histograms
    hist_orig = cv2.calcHist([img], [0], None, [256], [0, 256])
    hist_global = cv2.calcHist([global_img], [0], None, [256], [0, 256])
    hist_clahe = cv2.calcHist([clahe_img], [0], None, [256], [0, 256])

    # 4. Create 3x2 comparison grid (large 14x16 layout)
    fig, axs = plt.subplots(3, 2, figsize=(14, 16))

    # Row 0: Original
    axs[0, 0].imshow(img, cmap='gray')
    axs[0, 0].set_title("Original Image (Grayscale)", fontsize=12, fontweight='bold')
    axs[0, 0].axis('off')

    axs[0, 1].plot(hist_orig, color='black', linewidth=1.5)
    axs[0, 1].set_title("Original Histogram", fontsize=12, fontweight='bold')
    axs[0, 1].set_xlim([0, 256])
    axs[0, 1].set_xlabel("Pixel Intensity")
    axs[0, 1].set_ylabel("Frequency")
    axs[0, 1].grid(True, linestyle='--', alpha=0.5)

    # Row 1: Global Histogram Equalization
    axs[1, 0].imshow(global_img, cmap='gray')
    axs[1, 0].set_title("Global Equalization (cv2.equalizeHist)", fontsize=12, fontweight='bold')
    axs[1, 0].axis('off')

    axs[1, 1].plot(hist_global, color='royalblue', linewidth=1.5)
    axs[1, 1].set_title("Global Equalized Histogram", fontsize=12, fontweight='bold')
    axs[1, 1].set_xlim([0, 256])
    axs[1, 1].set_xlabel("Pixel Intensity")
    axs[1, 1].set_ylabel("Frequency")
    axs[1, 1].grid(True, linestyle='--', alpha=0.5)

    # Row 2: CLAHE
    axs[2, 0].imshow(clahe_img, cmap='gray')
    axs[2, 0].set_title("CLAHE Adaptive Equalization", fontsize=12, fontweight='bold')
    axs[2, 0].axis('off')

    axs[2, 1].plot(hist_clahe, color='forestgreen', linewidth=1.5)
    axs[2, 1].set_title("CLAHE Histogram", fontsize=12, fontweight='bold')
    axs[2, 1].set_xlim([0, 256])
    axs[2, 1].set_xlabel("Pixel Intensity")
    axs[2, 1].set_ylabel("Frequency")
    axs[2, 1].grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()

    # 5. Save figure to BytesIO buffer, encode to Base64, and close
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    buf.seek(0)
    encoded_string = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    image_url = f"data:image/png;base64,{encoded_string}"

    return {
        "processed_image": image_url,
        "output_image": image_url
    }


@app.post("/api/lab4-feature-matching")
@app.post("/api/surf-features")
@app.post("/api/surf")
async def process_lab4(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...)
):
    # 1. Read both uploaded images and convert to grayscale
    contents1 = await file1.read()
    contents2 = await file2.read()
    np_arr1 = np.frombuffer(contents1, np.uint8)
    np_arr2 = np.frombuffer(contents2, np.uint8)

    img1 = cv2.imdecode(np_arr1, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imdecode(np_arr2, cv2.IMREAD_GRAYSCALE)

    if img1 is None or img2 is None:
        return {"error": "Invalid image file(s) uploaded. Please provide two valid images."}

    # 2. Try initializing SURF with fallback to SIFT if patent restricted
    try:
        detector = cv2.xfeatures2d.SURF_create(hessianThreshold=400)
        detector_name = "SURF"
    except (cv2.error, AttributeError, Exception):
        detector = cv2.SIFT_create()
        detector_name = "SIFT (SURF Fallback)"

    # 3. Initialize ORB detector
    orb = cv2.ORB_create()

    # 4. Detect keypoints and compute descriptors
    kp1, des1 = detector.detectAndCompute(img1, None)
    kp2, des2 = detector.detectAndCompute(img2, None)

    # Detect ORB keypoints for Image 1
    kp1_orb, _ = orb.detectAndCompute(img1, None)

    # 5. Match descriptors using BFMatcher and take top 50 matches
    if des1 is not None and des2 is not None and len(des1) > 0 and len(des2) > 0:
        bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=True)
        matches = bf.match(des1, des2)
        matches = sorted(matches, key=lambda x: x.distance)
        top_matches = matches[:50]
        img_matches = cv2.drawMatches(
            img1, kp1, img2, kp2, top_matches, None,
            flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
        )
        match_title = f"3. Feature Matches (Top {len(top_matches)} via {detector_name})"
    else:
        # Fallback if no descriptors found
        h1, w1 = img1.shape
        h2, w2 = img2.shape
        img_matches = np.zeros((max(h1, h2), w1 + w2), dtype=np.uint8)
        img_matches[:h1, :w1] = img1
        img_matches[:h2, w1:w1 + w2] = img2
        match_title = "3. No Feature Matches Found"

    # Draw keypoints on Image 1
    img1_kp = cv2.drawKeypoints(img1, kp1, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    img1_orb = cv2.drawKeypoints(img1, kp1_orb, None, color=(0, 255, 0), flags=0)

    # 6. Create 1x3 Matplotlib comparison grid (20x6)
    fig, axs = plt.subplots(1, 3, figsize=(20, 6))

    axs[0].imshow(cv2.cvtColor(img1_kp, cv2.COLOR_BGR2RGB))
    axs[0].set_title(f"1. Image 1 {detector_name} Keypoints ({len(kp1)} pts)", fontsize=13, fontweight='bold')
    axs[0].axis('off')

    axs[1].imshow(cv2.cvtColor(img1_orb, cv2.COLOR_BGR2RGB))
    axs[1].set_title(f"2. Image 1 ORB Keypoints ({len(kp1_orb)} pts)", fontsize=13, fontweight='bold')
    axs[1].axis('off')

    axs[2].imshow(cv2.cvtColor(img_matches, cv2.COLOR_BGR2RGB) if len(img_matches.shape) == 3 else img_matches, cmap='gray' if len(img_matches.shape) == 2 else None)
    axs[2].set_title(match_title, fontsize=13, fontweight='bold')
    axs[2].axis('off')

    plt.tight_layout()

    # 7. Save figure to BytesIO buffer and Base64 encode
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=130)
    buf.seek(0)
    encoded_string = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    image_url = f"data:image/png;base64,{encoded_string}"

    return {
        "processed_image": image_url,
        "output_image": image_url
    }


def plot_gallery(images, titles, h, w, n_row=3, n_col=4):
    """Helper function to plot a gallery of portraits and return Base64 PNG string"""
    fig, axs = plt.subplots(n_row, n_col, figsize=(1.8 * n_col, 2.4 * n_row))
    axs = axs.flatten()
    for i in range(n_row * n_col):
        if i < len(images):
            axs[i].imshow(images[i].reshape((h, w)), cmap=plt.cm.gray)
            axs[i].set_title(titles[i], size=9)
            axs[i].axis('off')
        else:
            axs[i].axis('off')
    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return f"data:image/png;base64,{encoded}"


@app.post("/api/lab5-pca")
@app.post("/api/pca")
async def process_lab5_pca():
    # 1. Fetch LFW dataset (min_faces_per_person=70, resize=0.4)
    lfw_people = fetch_lfw_people(min_faces_per_person=70, resize=0.4)
    n_samples, h, w = lfw_people.images.shape
    X = lfw_people.data
    n_features = X.shape[1]
    y = lfw_people.target
    target_names = lfw_people.target_names
    n_classes = target_names.shape[0]

    # Dataset summary string
    dataset_summary = (
        f"Total dataset size:\n"
        f"n_samples: {n_samples}\n"
        f"n_features: {n_features}\n"
        f"n_classes: {n_classes}"
    )

    # 2. Split into train/test (80/20, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    # 3. Fit PCA (n_components=150, svd_solver='randomized', whiten=True) on X_train
    # and transform both train and test sets
    n_components = 150
    pca = PCA(
        n_components=n_components, svd_solver='randomized', whiten=True
    ).fit(X_train)

    X_train_pca = pca.transform(X_train)
    X_test_pca = pca.transform(X_test)

    # 4. Train an SVM (kernel='rbf', class_weight='balanced') on X_train_pca and predict X_test_pca
    clf = SVC(kernel='rbf', class_weight='balanced')
    clf = clf.fit(X_train_pca, y_train)
    y_pred = clf.predict(X_test_pca)

    # 5. Generate classification report as a string
    report_str = classification_report(y_test, y_pred, target_names=target_names)

    # 6. Eigenfaces Plot: The first 12 components reshaped to image dimensions
    eigenfaces = pca.components_.reshape((n_components, h, w))
    eigenface_titles = [f"eigenface {i + 1}" for i in range(12)]
    eigenfaces_image = plot_gallery(eigenfaces[:12], eigenface_titles, h, w, n_row=3, n_col=4)

    # 7. Failures Plot: 12 faces from X_test where y_pred != y_test
    # with titles showing "P: [Predicted Name] \n T: [True Name]"
    misclassified_indices = np.where(y_pred != y_test)[0]
    n_failures = min(12, len(misclassified_indices))
    if n_failures > 0:
        failure_images = [X_test[idx] for idx in misclassified_indices[:n_failures]]
        failure_titles = [
            f"P: {target_names[y_pred[idx]]}\nT: {target_names[y_test[idx]]}"
            for idx in misclassified_indices[:n_failures]
        ]
        failures_image = plot_gallery(failure_images, failure_titles, h, w, n_row=3, n_col=4)
    else:
        fig, ax = plt.subplots(figsize=(6, 2))
        ax.text(0.5, 0.5, "No classification errors (100% accuracy)", ha='center', va='center', fontsize=12)
        ax.axis('off')
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=120)
        buf.seek(0)
        encoded = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        failures_image = f"data:image/png;base64,{encoded}"

    # 8. Return JSON response
    return {
        "dataset_summary": dataset_summary,
        "classification_report": report_str,
        "eigenfaces_image": eigenfaces_image,
        "failures_image": failures_image
    }


@app.post("/api/lab6-yolo")
async def process_lab6_yolo(
    file: UploadFile = File(...)
):
    # 1. Read uploaded image using cv2.imdecode
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Invalid image file uploaded. Please upload a valid image."}

    # 2. Load custom model best.pt with fallback to yolo11n.pt
    model_path = "best.pt"
    if not os.path.exists(model_path):
        candidate = os.path.join(os.path.dirname(os.path.abspath(__file__)), "best.pt")
        if os.path.exists(candidate):
            model_path = candidate

    try:
        model = YOLO(model_path)
    except Exception:
        try:
            model = YOLO("best.pt")
        except Exception:
            model = YOLO("yolo11n.pt")

    # 3. Run inference
    results = model(img)

    # 4. Extract plotted image array with bounding boxes
    plotted_img = results[0].plot()

    # 5. Convert plotted_img from BGR to RGB
    plotted_img_rgb = cv2.cvtColor(plotted_img, cv2.COLOR_BGR2RGB)

    # 6. Save numpy array as JPEG to a BytesIO buffer and encode to Base64
    pil_img = Image.fromarray(plotted_img_rgb)
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=95)
    encoded_string = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "processed_image": f"data:image/jpeg;base64,{encoded_string}"
    }


# Load DeepLabV3 model globally outside route for semantic segmentation
semantic_model = models.segmentation.deeplabv3_resnet50(
    weights=models.segmentation.DeepLabV3_ResNet50_Weights.DEFAULT
).eval()


@app.post("/api/lab7-segmentation")
async def process_lab7_segmentation(
    file: UploadFile = File(...)
):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Invalid image file uploaded. Please upload a valid image."}

    # Helper function to convert OpenCV image array to Base64 JPEG string
    def to_base64_jpeg(image_np):
        _, buffer = cv2.imencode('.jpg', image_np)
        encoded = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded}"

    # 1. Thresholding: Convert to grayscale, apply Otsu's and Adaptive Gaussian Thresholding
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

    # 2. Region-Based (Watershed): Morphological Opening, Distance Transform, Connected Components, Watershed
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    sure_bg = cv2.dilate(opening, kernel, iterations=3)
    dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    _, sure_fg = cv2.threshold(dist_transform, 0.7 * dist_transform.max(), 255, 0)
    sure_fg = np.uint8(sure_fg)
    unknown = cv2.subtract(sure_bg, sure_fg)
    _, markers = cv2.connectedComponents(sure_fg)
    markers = markers + 1
    markers[unknown == 255] = 0
    watershed_img = img.copy()
    markers = cv2.watershed(watershed_img, markers)
    watershed_img[markers == -1] = [0, 0, 255]  # highlight boundaries in red

    # 3. Edge-Based: Canny Edge detection & contours in green
    canny = cv2.Canny(gray, 100, 200)
    contours, _ = cv2.findContours(canny, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours_img = img.copy()
    cv2.drawContours(contours_img, contours, -1, (0, 255, 0), 2)

    # 4. Semantic Segmentation: DeepLabV3 with COLORMAP_JET
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    preprocess = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    input_tensor = preprocess(pil_img).unsqueeze(0)
    with torch.no_grad():
        output = semantic_model(input_tensor)['out'][0]
    output_predictions = output.argmax(0).byte().cpu().numpy()
    scaled_pred = np.uint8((output_predictions.astype(np.float32) / 21.0) * 255.0)
    semantic_colormap = cv2.applyColorMap(scaled_pred, cv2.COLORMAP_JET)

    # 5. Return JSON dictionary containing all 6 Base64 strings
    return {
        "otsu_image": to_base64_jpeg(otsu),
        "adaptive_image": to_base64_jpeg(adaptive),
        "watershed_image": to_base64_jpeg(watershed_img),
        "canny_image": to_base64_jpeg(canny),
        "contours_image": to_base64_jpeg(contours_img),
        "semantic_image": to_base64_jpeg(semantic_colormap)
    }

