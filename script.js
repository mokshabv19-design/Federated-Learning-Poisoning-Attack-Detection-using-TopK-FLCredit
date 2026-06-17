// script.js (Inside the 'frontend' folder)

// --- CSV PARSING ---
function parseCsvFiles(files) {
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

// --- PARAMETER RETRIEVAL (Reads hidden fields) ---
function getParamsFromUI() {
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
    setStatus("Sending data to Python server...", false);
    
    const payload = {
        files: allFileRows,
        params: params,
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/api/run_simulation", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorText = `Simulation failed (Status ${response.status}).`;
            try {
                // Read the specific error message returned by the Python backend (e.g., ValueError)
                const errorData = await response.json();
                errorText = errorData.error || errorText;
            } catch {}
            throw new Error(errorText);
        }

        setStatus("Simulation complete. Redirecting to results...", false);
        // Successful Redirection
        window.location.href = "/results"; 
        
    } catch (error) {
        setStatus(`ERROR: ${error.message}`, true);
    }
}

// --- STATUS HELPER ---
function setStatus(text, isError) {
  const msgElement = document.getElementById("statusMessage");
  msgElement.innerText = text;
  msgElement.style.color = isError ? "#ff8a8a" : "#aaffb3"; 
}


// --- EVENT LISTENER ---
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