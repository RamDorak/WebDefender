# WebDefender
A multi-layered phishing/ malware defender extension for Google Chrome

## 🔗 Project Overview
This project is a **full-fledged dynamic web extension** designed to detect phishing and scam websites using a **multi-layered security approach** combining **Machine Learning, Natural Language Processing, Computer Vision, and Behavior Analysis**. 

The extension protects users by analyzing websites in real-time, detecting suspicious behavior, and warning users before they enter sensitive data.

---

## ✨ Key Features

### ✅ 1. URL-Based Detection (First Layer)
- Uses **WHOIS Lookup** to check domain age and registration details.
- Flags domains registered in the **last 3-6 months** (common in phishing attacks).
- Cross-checks with known scam databases using services like:
    - WhoisXML API
    - DomainTools

---

### ✅ 2. Machine Learning URL Classifier (Second Layer)
- Trains an **XGBoost-based classifier** to detect suspicious URLs.
- Extracts URL features such as:
    - Length of URL
    - Number of special characters
    - Number of subdomains
- Classifies URLs as **Safe, Suspicious, or Malicious** directly in the extension.

---

### ✅ 3. Content & Behavior Analysis (Third Layer)
- **NLP Analysis on Page Text**: Uses **BERT or LSTM** to detect phishing language (e.g., urgency, threats, or fake warnings).
- **JavaScript Behavior Monitoring**: Tracks:
    - Unexpected redirects
    - Hidden forms & fake pop-ups
    - Keylogging or form-jacking attempts
- **Real-time Page Inspection**: Checks for deceptive elements like:
    - Hidden input fields
    - Fake login forms redirecting to untrusted domains
    - Invisible overlays intercepting user clicks

---

### ✅ 4. Screenshot-Based Detection (Optional Advanced Layer)
- Captures website screenshots for visual similarity comparison.
- Uses **SSIM (Structural Similarity Index)** and **OpenCV** to detect phishing lookalikes.
- Compares page visuals with a trusted site database.
- Flags sites that **look nearly identical** to popular sites but have suspicious domains.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
|---|---|
| URL Classifier | Python (XGBoost, Scikit-learn) |
| NLP Analysis | BERT (Hugging Face) or LSTM |
| Behavior Monitoring | JavaScript (content scripts in the extension) |
| WHOIS Lookup | WhoisXML API / DomainTools API |
| Screenshot Comparison | Python (OpenCV, Selenium, Flask) |
| Extension Integration | JavaScript, TensorFlow.js, Chrome Extension APIs |

---

## 📊 Full Workflow Overview

```text
1️⃣ Check domain age and WHOIS data.
2️⃣ Run ML-based URL classification.
3️⃣ Analyze page content using NLP models.
4️⃣ Monitor runtime JavaScript behavior.
5️⃣ (Optional) Use screenshot-based phishing detection for high-risk sites.
