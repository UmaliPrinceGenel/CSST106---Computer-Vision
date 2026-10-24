# CSST106 — Computer Vision Laboratory Web Application

An interactive, full-stack Computer Vision laboratory platform integrating a modern React (Material-UI) dashboard frontend with a Python FastAPI backend. The application features practical implementations of fundamental and advanced computer vision techniques.

---

## 🔬 Included Laboratory Activities

1. **Lab 1: Image Processing & Manipulation** — Basic transformations including grayscale conversion, ROI cropping, resizing, and rotation.
2. **Lab 2: Edge Detection** — Comparative gradient analysis using Sobel operators and Canny edge detection algorithms.
3. **Lab 3: Histogram Analysis & Equalization** — Contrast enhancement utilizing global histogram equalization and Contrast Limited Adaptive Histogram Equalization (CLAHE).
4. **Lab 4: Feature Detection & Matching** — Keypoint detection and descriptor matching using SURF, SIFT, and ORB with Brute-Force Matcher.
5. **Lab 5: PCA & Eigenfaces** — Dimensionality reduction with Principal Component Analysis and facial recognition classification using Support Vector Machines (SVM) on the LFW dataset.
6. **Lab 6: Object Detection (YOLO)** — Real-time bounding box detection using custom YOLO model weights (`best.pt`).
7. **Lab 7: Image Segmentation** — Multi-technique segmentation including Otsu's thresholding, Adaptive Gaussian thresholding, Watershed algorithm, contour detection, and DeepLabV3 semantic segmentation.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed on your system:

- **Python**: `v3.10` or higher
- **Node.js**: `v18.x` or higher (with `npm` or `yarn`)
- **PHP**: `v8.2` or higher

---

## ⚠️ Important Note on Model Weights (`best.pt`)

> [!IMPORTANT]
> For **Lab 6 (YOLO Object Detection)**, ensure your custom trained model weights file named **`best.pt`** is placed inside the **`cv-server/`** directory before starting the backend server.
>
> In case `best.pt` is missing or you need to download the pre-trained weights directly:
>
> 📥 **[Download best.pt from Google Drive](https://drive.google.com/file/d/15ZVRLubruSjDUlvdEeRk7hyGL6wPeWer/view?usp=sharing)**
>
> After downloading, place the file in the `cv-server/` folder:
> ```text
> cv-server/
> ├── main.py
> └── best.pt   <-- Ensure this weights file is present
> ```

---

## 🚀 How to Run

Follow these two steps to start the application locally:

### Step 1: Start the Backend (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd cv-server
   ```
2. Start the FastAPI server using Uvicorn:
   ```bash
   py -m uvicorn main:app --reload --port 8000
   ```
   *The backend API will be available and listening at:* `http://127.0.0.1:8000`

---

### Step 2: Start the Frontend (React / Vite)

1. Open a **second terminal** in the project root directory (`CV_LabActs`).
2. *(First-time setup only)* Install dependencies if not already installed:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will be available at:* `http://localhost:3000`

---

## 🌐 Environment Configuration

A clean environment template is provided in [.env.example](.env.example). You can create your local `.env` by copying it:

```bash
cp .env.example .env
```
