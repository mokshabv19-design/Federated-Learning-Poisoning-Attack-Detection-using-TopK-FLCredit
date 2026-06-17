# flcredit_logic.py (Inside the 'server' folder)
import numpy as np
import random 

def calculate_client_credit_score(client_gradients):
    """Calculates a credit score (0-100%) based on the L2 norm of the client's gradients."""
    if not client_gradients:
        return 0.0
        
    # --- FINAL CRITICAL FIX: Robust Data Cleaning and Conversion ---
    valid_gradients = []
    for g in client_gradients:
        g_stripped = g.strip()
        if not g_stripped:
            continue  # Skip empty strings

        # Try to convert to float (this is the key failure point if data is bad)
        try:
            valid_gradients.append(float(g_stripped))
        except ValueError:
            # If conversion fails for ANY gradient value, skip this value, but continue
            continue
            
    if not valid_gradients:
        return 0.0 # If all gradient entries were invalid or empty

    try:
        gradients = np.array(valid_gradients)
        l2_norm = np.linalg.norm(gradients)
        
    except Exception:
        return 0.0 # Catch all other NumPy errors

    # The rest of the scoring logic remains the same
    max_expected_norm = 5.0 
    normalized_norm = min(l2_norm, max_expected_norm) / max_expected_norm
    
    score = 100.0 - (normalized_norm * 100.0)
    score = max(0.0, score + np.random.uniform(-0.5, 0.5)) 
    return score

def run_flcredit_simulation(all_client_data, params):
    """Core function to run the FL protocol simulation and identify malicious clients."""
    
    data_rows = all_client_data
    
    # Robust header skip
    if data_rows and data_rows[0] and data_rows[0][0] and data_rows[0][0].lower().startswith('client'):
        data_rows = data_rows[1:] 
    
    client_info = []
    
    # Process remaining data rows
    for row in data_rows:
        if len(row) < 2:
            continue
            
        client_id = row[0]
        gradients = row[1:] 
        score_before = calculate_client_credit_score(gradients)
        client_info.append({
            'id': client_id,
            'score_before': score_before,
            'gradients': gradients,
            'is_selected_topk': False, 
            'score_after_reconfig': score_before, 
        })

    if not client_info:
        raise ValueError("No valid client data could be processed from the uploaded CSV.")

    threshold = params['threshold']
    malicious_idx_before = [i for i, c in enumerate(client_info) if c['score_before'] < threshold]
    client_losses = [(100 - c['score_before'], i) for i, c in enumerate(client_info)]
    client_losses.sort(key=lambda x: x[0]) 
    topk = min(params['topk'], len(client_info))
    topk_selection_indices = [idx for loss, idx in client_losses[:topk]]
    
    for idx in topk_selection_indices:
        client_info[idx]['is_selected_topk'] = True
        
    malicious_in_topk = [i for i in topk_selection_indices if i in malicious_idx_before]
    trustworthy_idx_after = [i for i in range(len(client_info)) if i not in malicious_idx_before]
    malicious_idx_after = malicious_idx_before 

    return {
        'params': params,
        'client_info': client_info,
        'threshold': threshold,
        'topk': params['topk'],
        'malicious_idx_before': malicious_idx_before,
        'malicious_in_topk': malicious_in_topk,
        'malicious_idx_after': malicious_idx_after,
        'trustworthy_idx_after': trustworthy_idx_after,
    }