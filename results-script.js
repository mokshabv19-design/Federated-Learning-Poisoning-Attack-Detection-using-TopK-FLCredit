// results-script.js (Fetches and renders simulation results)

let chart = null;

document.addEventListener('DOMContentLoaded', fetchAndRenderResults);

async function fetchAndRenderResults() {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.innerText = "Fetching results...";
    
    try {
        const response = await fetch("http://127.0.0.1:5000/api/get_results");
        
        if (response.status === 404) {
             loadingMessage.innerHTML = "No simulation data found. <a href='/'>Please run the simulation first.</a>";
             return;
        }

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error || `Server Error (${response.status}) while fetching results.`);
        }

        const data = await response.json();
        
        // Hide loading and show sections
        loadingMessage.classList.add('hidden');
        // NOTE: These IDs correspond to the HTML sections (02, 03, 04, 05)
        document.getElementById("parameterSection").classList.remove('hidden'); 
        document.getElementById("clientAnalysisSection").classList.remove('hidden'); 
        document.getElementById("protocolAnalysisSection").classList.remove('hidden'); 
        document.getElementById("finalStatusSection").classList.remove('hidden');

        // Render data
        renderParameters(data.params);
        renderClientTable(data);
        renderChart(data);
        updateAlert(data);
        updateFinalStatus(data);
        
    } catch (error) {
        loadingMessage.innerHTML = `Error loading results: ${error.message}. Ensure the Python server is running on http://127.0.0.1:5000.`;
    }
}

// Function 1: Render Protocol Parameters (Section 02)
function renderParameters(params) {
    const display = document.getElementById("parameterDisplay");
    
    // NOTE: This text reflects the new Section 02 numbering
    display.innerHTML = `
        <label>Number of Clients (N): <span>${params.n_clients}</span></label>
        <label>Poison Rate (0.0 - 1.0): <span>${params.poison_rate}</span></label>
        <label>Rounds: <span>${params.rounds}</span></label>
        <label>Poison Type: <span>${params.poison_type}</span></label>
        <label>Top K Selection (K &lt; N): <span>${params.topk}</span></label>
        <label>Seed: <span>${params.seed}</span></label>
        <label>KW (reconfig replace count): <span>${params.kw}</span></label>
        <label>Trust Threshold (%): <span>${params.threshold}</span></label>
    `;
}

// Function 2: Render Client Table (Section 03)
function renderClientTable(data) {
    const table = document.getElementById("clientDetailsTable");
    const threshold = data.threshold;
    let html = `
        <thead>
            <tr>
                <th>Client ID</th>
                <th>Initial Credit Score (%)</th>
                <th>Status (Score < ${threshold}%)</th>
                <th>Selected in Top K (${data.topk})</th>
                <th>Final Score (After Reconfig)</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.client_info.forEach((c) => {
        const isMalicious = c.score_before < threshold; 
        const statusClass = isMalicious ? 'malicious-status' : 'trustworthy-status';
        
        const statusText = isMalicious ? 'SUSPECTED MALICIOUS' : 'TRUSTWORTHY';
        const isTopK = c.is_selected_topk ? 'YES' : 'NO';
        
        html += `
            <tr style="background-color: ${c.is_selected_topk ? 'rgba(85, 193, 255, 0.05)' : 'none'};">
                <td>${c.id}</td>
                <td>${c.score_before.toFixed(2)}%</td>
                <td class="${statusClass}">${statusText}</td>
                <td>${isTopK}</td>
                <td>${c.score_after_reconfig.toFixed(2)}%</td>
            </tr>
        `;
    });

    html += `</tbody>`;
    table.innerHTML = html;
}

// Function 3: Render Chart (Section 04)
function renderChart(data) {
  const clientInfo = data.client_info;
  const ids = clientInfo.map(c => "Client " + c.id);
  // Loss is 100 - Score (Used for visualization: lower score/higher loss = lower selection priority)
  const losses = clientInfo.map(c => 100 - c.score_before); 
  const lossThreshold = 100 - data.threshold;

  const barColors = clientInfo.map(c => {
    // A client is considered 'Malicious' if their score is below the threshold, 
    // which corresponds to a Loss greater than the Loss Threshold.
    const isMaliciousClient = (100 - c.score_before) > lossThreshold; 
    
    // --- COLOR LOGIC: RED/GREEN/PURPLE ---
    if (isMaliciousClient) {
        // Red: Malicious client
        return "rgba(255,80,80,0.9)"; 
    } 
    
    else if (c.is_selected_topk) {
        // Green: Trustworthy & Selected in Top K
        return "rgba(50,200,120,0.9)"; 
    }
    
    // Purple/Violet: Trustworthy & NOT Selected
    return "rgba(200,120,200,0.7)"; 
  });

  const ctx = document.getElementById("barChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ids,
      datasets: [{
        label: 'Client Loss (Lower = Higher Selection Priority)',
        data: losses,
        backgroundColor: barColors,
        borderColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: 'Loss (Lower = Higher Selection Priority)', 
            color: '#e6f7ff' 
          },
          ticks: {
            color: '#e6f7ff'
          }
        },
        x: { 
          ticks: {
            color: '#e6f7ff'
          }
        }
      },
      plugins: { 
        legend: { 
            display: false 
        }
      }
    }
  });
}

// Function 4: Update Alert Box (Part of Section 04 Analysis)
function updateAlert(data) {
    const malInTopk = data.malicious_in_topk || [];
    const alertBox = document.getElementById("alert");
    if (malInTopk.length > 0) {
        alertBox.classList.remove("hidden");
        alertBox.innerHTML = `**ALERT:** Top-K Selected Clients include malicious actors! Total malicious clients detected before reconfiguration: **${data.malicious_idx_before.length}**`;
    } else {
        alertBox.classList.add("hidden");
        alertBox.innerHTML = `**STATUS:** Top-K Selected Clients are trustworthy.`;
    }
}

// Function 5: Update Final Status (Section 05)
function updateFinalStatus(data) {
  const finalCount = (data.malicious_idx_after || []).length;
  const finalStatus = document.getElementById("finalStatus");
  
  if (finalCount > 0) {
      finalStatus.innerText = `ATTACK DETECTED: ${finalCount} potential malicious clients remaining after reconfiguration.`;
      finalStatus.style.color = "#ff5a5a";
      finalStatus.style.borderColor = "#ff4d4d";
  } else {
      finalStatus.innerText = `SECURITY STATUS: SAFE. All malicious clients were neutralized/removed.`;
      finalStatus.style.color = "#aaffb3";
      finalStatus.style.borderColor = "#aaffb3";
  }

  const trustList = document.getElementById("trustList");
  const trustworthyClientIds = data.client_info
    .filter((c, index) => data.trustworthy_idx_after.includes(index))
    .map(c => `Client ${c.id}`);

  if (trustworthyClientIds.length === 0) {
    trustList.innerText = "No trustworthy clients selected after final check.";
  } else {
    trustList.innerHTML = "<h4>TRUSTWORTHY CLIENTS SELECTED:</h4>" + trustworthyClientIds.join(" | ");
  }
}