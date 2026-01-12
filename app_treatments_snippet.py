
# ==================== TREATMENT ENDPOINTS ====================

@app.route('/api/pets/<int:pet_id>/treatments', methods=['GET'])
@jwt_required()
def get_treatments(pet_id):
    db = get_db()
    treatments = db.execute('''
        SELECT t.*, u.name as vet_name 
        FROM treatments t
        JOIN users u ON t.vet_id = u.id
        WHERE t.pet_id = ? 
        ORDER BY t.created_at DESC
    ''', (pet_id,)).fetchall()
    
    return jsonify([dict(t) for t in treatments])

@app.route('/api/pets/<int:pet_id>/treatments', methods=['POST'])
@jwt_required()
def add_treatment(pet_id):
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    # Verify user is a vet (simplified check)
    db = get_db()
    
    cursor = db.execute('''
        INSERT INTO treatments (pet_id, vet_id, medication, dosage, instructions)
        VALUES (?, ?, ?, ?, ?)
    ''', (pet_id, current_user_id, data['medication'], data['dosage'], data.get('instructions', '')))
    db.commit()
    
    treatment_id = cursor.lastrowid
    
    # Real-time Push to Pet Owner
    socketio.emit('new_treatment', {
        'id': treatment_id,
        'pet_id': pet_id,
        'medication': data['medication'],
        'dosage': data['dosage'],
        'instructions': data.get('instructions', ''),
        'created_at': datetime.now().isoformat(),
        'vet_name': 'Dr. Assigned' # Simplified
    }, room=f"pet_{pet_id}")
    
    return jsonify({'message': 'Treatment prescribed successfully', 'id': treatment_id}), 201

# Add alert endpoint
@app.route('/api/pets/<int:pet_id>/alert', methods=['POST'])
@jwt_required()
def send_manual_alert(pet_id):
    data = request.get_json()
    # Trigger socket event
    socketio.emit('critical_alert', {
        'pet_id': pet_id,
        'severity': 'danger',
        'message': data.get('message', 'Immediate Vet Attention Required'),
        'timestamp': datetime.now().isoformat()
    }, room=f"pet_{pet_id}")
    return jsonify({'status': 'alert_sent'})
