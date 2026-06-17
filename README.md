# Federated Learning Poisoning Attack Detection Using TopK-FLCredit

## Overview

Federated Learning (FL) enables multiple clients to collaboratively train a machine learning model without sharing their raw data, preserving user privacy. However, FL systems are vulnerable to poisoning attacks, where malicious participants submit manipulated model updates to degrade the performance of the global model.

This project implements a secure Federated Learning framework using the **TopK-FLCredit Reconfiguration Algorithm**. The system evaluates the reliability of client updates through a credit-based trust mechanism and selects only the most trustworthy clients for model aggregation. By filtering suspicious updates and identifying malicious participants, the framework improves the security, stability, and accuracy of the federated learning process.

## Key Features

* Secure Federated Learning Simulation
* Poisoning Attack Detection and Mitigation
* FLCredit Trust-Based Scoring System
* Top-K Client Update Selection
* Malicious Client Identification
* Dynamic Reconfiguration Mechanism
* Interactive Web-Based Dashboard
* Security Analysis and Visualization
* Configurable Simulation Parameters

## Problem Statement

Traditional Federated Learning systems rely on client-submitted model updates without fully verifying their integrity. Malicious clients can exploit this weakness by sending poisoned updates, causing:

* Reduced model accuracy
* Biased predictions
* Unstable training
* Potential model failure

This project addresses these challenges through a dual-layer defense mechanism combining Top-K update filtering and FLCredit trust evaluation.

## Proposed Solution

### TopK Selection

The system selects only the most reliable K client updates for aggregation based on their consistency and performance.

### FLCredit Trust Evaluation

Each client is assigned a trust score based on its historical behavior and update quality. Clients with low trust scores are identified as potential attackers and excluded from the aggregation process.

### Reconfiguration Strategy

Suspicious clients are dynamically replaced or removed, ensuring that only trustworthy participants contribute to the global model.

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* Flask
* Flask-CORS

## Project Structure

```text
Federated-Learning-Poisoning-Attack-Detection/
│
├── frontend/
│   ├── index.html
│   ├── results.html
│   ├── script.js
│   ├── index-script.js
│   ├── results-script.js
│   └── style.css
│
├── server/
│   ├── app.py
│   ├── flcredit_logic.py
│   └── requirements.txt
│
├── .vscode/
│
└── README.md
```

## Installation and Execution

### Step 1: Navigate to Server Folder

```bash
cd server
```

### Step 2: Install Required Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run the Backend Server

```bash
python app.py
```

### Step 4: Launch the Frontend

Open the `frontend/index.html` file in your web browser.

## Simulation Parameters

The simulator supports the following configurable parameters:

* Number of Clients (N)
* Poison Rate
* Number of Training Rounds
* Poison Type
* Top-K Selection Value
* Random Seed
* Reconfiguration Count (KW)
* Trust Threshold

## Sample Outcome

The system generates:

* Client Trust Scores
* Top-K Client Selection Results
* Malicious Client Detection Report
* Security Analysis Dashboard
* Final Attack Detection Status

## Benefits

* Improves robustness against poisoning attacks
* Enhances trust in federated learning environments
* Maintains model accuracy and stability
* Supports secure collaborative machine learning
* Provides clear visualization of client behavior

## Future Enhancements

* Integration with real-world datasets
* Deep Learning model support
* Advanced anomaly detection techniques
* Blockchain-based trust management
* Distributed deployment environment

## Author

**Moksha B V**

Computer Science Engineer

## License

This project is developed for academic and educational purposes.
