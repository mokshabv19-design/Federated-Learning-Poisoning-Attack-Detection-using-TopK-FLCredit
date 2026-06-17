# app.py (Inside the 'server' folder)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np 
from flcredit_logic import run_flcredit_simulation 

# --- FINAL ABSOLUTE PATH FIX ---
server_dir = os.path.abspath(os.path.dirname(__file__))
project_root = os.path.join(server_dir, '..')
frontend_path = os.path.join(project_root, 'frontend') 

STORED_SIMULATION_RESULTS = None 

app = Flask(__name__, 
            static_folder=frontend_path, 
            template_folder=frontend_path) 
CORS(app)

# --- FILE SERVING ENDPOINTS ---

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/results')
def serve_results():
    return send_from_directory(app.static_folder, 'results.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serves all static assets (scripts.js, results-script.js, style.css)."""
    return send_from_directory(app.static_folder, filename)

# --- API ENDPOINTS ---

@app.route('/api/run_simulation', methods=['POST'])
def run_simulation_and_store():
    global STORED_SIMULATION_RESULTS
    try:
        data = request.get_json()
        all_file_rows = data['files']
        params = data['params']
        
        # Flatten list of lists and filter invalid rows
        all_client_data = [row for file_rows in all_file_rows for row in file_rows if row and len(row) > 1]
        
        if not all_client_data:
             return jsonify({'error': 'No valid data uploaded. File might be empty or incorrectly formatted.'}), 400

        # Execute simulation
        STORED_SIMULATION_RESULTS = run_flcredit_simulation(all_client_data, params)
        
        return jsonify({'message': 'Simulation complete. Redirecting.'})

    except Exception as e:
        app.logger.error(f"Simulation error: {e}")
        return jsonify({'error': f'Simulation Failed: {str(e)}'}), 400

@app.route('/api/get_results', methods=['GET'])
def get_results():
    global STORED_SIMULATION_RESULTS
    if STORED_SIMULATION_RESULTS:
        return jsonify(STORED_SIMULATION_RESULTS)
    else:
        return jsonify({'error': 'No simulation data found. Please run the simulation first.'}), 404

if __name__ == '__main__':
    print(f"Starting server. Frontend files are being served from: {frontend_path}")
    print("Access the input page at: http://127.0.0.1:5000/")
    app.run(debug=True, port=5000)