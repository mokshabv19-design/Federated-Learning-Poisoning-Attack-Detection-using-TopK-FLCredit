# Federated Learning Poisoning Attack Detection using TopK-FLCredit

## Project Overview

This project implements a secure Federated Learning framework for detecting and mitigating poisoning attacks. The proposed TopK-FLCredit algorithm evaluates client trustworthiness using credit scores and selects only reliable client updates for global aggregation.

## Features

* Federated Learning Simulation
* Poisoning Attack Detection
* Top-K Client Selection
* FLCredit Trust Scoring
* Malicious Client Identification
* Dynamic Reconfiguration Mechanism
* Interactive Web Interface
* Security Analysis Dashboard

## Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* Flask
* Flask-CORS

## Folder Structure

frontend/ - User Interface

server/ - Backend Logic and API

.vscode/ - VS Code Configuration

README.md - Project Documentation

## How to Run

1. Open terminal.
2. Navigate to server folder.
3. Install dependencies:

pip install -r requirements.txt

4. Start the server:

python app.py

5. Open frontend/index.html in browser.

## Simulation Parameters

* Number of Clients
* Poison Rate
* Number of Rounds
* Poison Type
* Top-K Value
* Trust Threshold
* Reconfiguration Count

## Expected Output

The system identifies malicious clients, calculates trust scores, selects Top-K trustworthy clients, and generates a security analysis report showing poisoning attack detection results.

## Author

Moksha B V
