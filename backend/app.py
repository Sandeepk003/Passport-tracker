import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from models import db, Passport

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure SQLite Database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'passports.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize database
with app.app_context():
    db.create_all()

@app.route('/api/passports', methods=['POST'])
def add_passport():
    data = request.json
    
    # Simple validation
    if 'passports' not in data or not isinstance(data['passports'], list) or len(data['passports']) == 0:
        return jsonify({'error': f'Missing at least one passport entry in "passports" list'}), 400

    import json
    new_passport = Passport(
        order_id=data.get('order_id', ''),
        passports_data=json.dumps(data['passports']),
        received_date=data.get('received_date', ''),
        received_mode=data.get('received_mode', ''),
        received_by=data.get('received_by', ''),
        receiving_proof=data.get('receiving_proof', ''),
        status='Received'
    )

    try:
        db.session.add(new_passport)
        db.session.commit()
        return jsonify(new_passport.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/passports', methods=['GET'])
def list_passports():
    passports = Passport.query.order_by(Passport.created_at.desc()).all()
    return jsonify([p.to_dict() for p in passports]), 200

@app.route('/api/passports/<int:id>', methods=['GET'])
def get_passport(id):
    passport = Passport.query.get(id)
    if not passport:
        return jsonify({'error': 'Passport not found'}), 404
    return jsonify(passport.to_dict()), 200

@app.route('/api/passports/search', methods=['GET'])
def search_passports():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([]), 200

    results = Passport.query.filter(
        (Passport.passports_data.ilike(f'%{query}%')) |
        (Passport.order_id.ilike(f'%{query}%'))
    ).all()
    return jsonify([p.to_dict() for p in results]), 200

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Return URL to access this uploaded file
        file_url = f"/api/uploads/{unique_filename}"
        return jsonify({'url': file_url}), 200

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/passports/<int:id>', methods=['PUT'])
def update_passport(id):
    data = request.json
    passport = Passport.query.get(id)
    if not passport:
        return jsonify({'error': 'Passport not found'}), 404

    # Enforce Sequence
    STATUS_SEQUENCE = ['Received', 'Submitted to AVA', 'Collected from AVA', 'In Transit', 'Out for Delivery', 'Delivered']
    
    if 'status' in data:
        new_status = data['status']
        if new_status in STATUS_SEQUENCE:
            current_idx = STATUS_SEQUENCE.index(passport.status)
            new_idx = STATUS_SEQUENCE.index(new_status)
            # Only allow advancing by 1 stage, or keeping it the same, or reverting
            if new_idx > current_idx + 1:
                return jsonify({'error': f'Cannot jump from "{passport.status}" directly to "{new_status}". Must go strictly step-by-step.'}), 400

    # Update all provided fields
    fields_to_update = [
        'order_id', 'received_date', 'received_mode', 'received_by', 'receiving_proof',
        'ava_name_location', 'submission_date', 'submitted_to_ava_by', 'ava_received_by', 'ava_receiving_proof', 'cnr_number',
        'passport_collected_from_ava_by', 'collection_date',
        'delivery_mode', 'delivery_tracking_id', 'passport_delivered_date', 'delivery_proof', 'status'
    ]
    
    if 'passports' in data:
        import json
        passport.passports_data = json.dumps(data['passports'])

    for field in fields_to_update:
        if field in data:
            setattr(passport, field, data[field])

    try:
        db.session.commit()
        return jsonify(passport.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    all_orders = Passport.query.all()
    
    total = 0
    delivered = 0
    in_transit = 0
    pending = 0
    
    import json
    in_transit_statuses = ['Submitted to AVA', 'Collected from AVA', 'Out for Delivery', 'In Transit']
    
    for order in all_orders:
        try:
            passports = json.loads(order.passports_data)
            count = len(passports)
        except:
            count = 0
            
        total += count
        
        if order.status == 'Delivered':
            delivered += count
        elif order.status == 'Received':
            pending += count
        elif order.status in in_transit_statuses:
            in_transit += count

    return jsonify({
        'total': total,
        'in_transit': in_transit,
        'delivered': delivered,
        'pending': pending
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
