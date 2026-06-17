// index-script.js (Handles input, initiates simulation, and redirects)

// --- CSV PARSING ---
function parseCsvFiles(files) {
    // ... (Use the parseCsvFiles function from the previous complete code) ...
    // [The code is omitted here for brevity, use the version from the previous response]
    const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
                const rows = lines.map(line => line.split(",").map(s => s.trim()));
                resolve(rows); 
            };
            reader.onerror = e => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsText(file);
        });
    });
    return Promise.all(filePromises);
}

// --- PARAMETER RETRIEVAL ---
function getParamsFromUI() {
  // ... (Use the getParamsFromUI function from the previous complete code) ...
  return {
    n_clients: parseInt(document.getElementById("n_clients").value),
    rounds: parseInt(document.getElementById("rounds").value),
    poison_rate: parseFloat(document.getElementById("poison_rate").value),
    poison_type: document.getElementById("poison_type").value,
    topk: parseInt(document.getElementById("topk").value),
    seed: parseInt(document.getElementById("seed").value),
    kw: parseInt(document.getElementById("kw").value),
    threshold: parseFloat(document.getElementById("threshold").value),
  };
}


// --- API COMMUNICATION & REDIRECTION ---
async function runBackendSimulation(allFileRows, params) {
    // ... (Use the runBackendSimulation function from the previous complete code, which calls Port 5000) ...
    setStatus("Sending data to Python server...", false);
    
    const payload = {
        files: allFileRows,
        params: params,
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/api/run_simulation", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorText = `Server responded with status ${response.status}.`;
            try {
                const errorData = await response.json();
                errorText = errorData.error || errorText;
            } catch {}
            throw new Error(errorText);
        }

        setStatus("Simulation complete. Redirecting to results...", false);
        window.location.href = "/results"; // Redirects to the /results route
        
    } catch (error) {
        setStatus(`Connection Error: ${error.message}. Ensure 'python app.py' is running on http://127.0.0.1:5000/`, true);
    }
}

// --- STATUS HELPER ---
function setStatus(text, isError) {
  const msgElement = document.getElementById("statusMessage");
  msgElement.innerText = text;
  msgElement.style.color = isError ? "#ff8a8a" : "#aaffb3"; 
}


// --- EVENT LISTENER (CORE TRIGGER) ---
document.getElementById("runCsvBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("csvFile");
  const files = fileInput.files;
  
  if (files.length === 0) {
    setStatus("Please select one or more CSV files before running.", true);
    return;
  }
  
  parseCsvFiles(Array.from(files))
    .then(allFileRows => {
      const params = getParamsFromUI();
      return runBackendSimulation(allFileRows, params); 
    })
    .catch(err => setStatus(err.message, true));
});