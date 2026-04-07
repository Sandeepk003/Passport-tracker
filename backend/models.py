from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Passport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # 1. Passport Received
    order_id = db.Column(db.String(100), nullable=True)
    passports_data = db.Column(db.Text, nullable=False, default='[]') # JSON string of [{passport_number, applicant_name}]
    received_date = db.Column(db.String(50), nullable=True)
    received_mode = db.Column(db.String(100), nullable=True)
    received_by = db.Column(db.String(100), nullable=True)
    receiving_proof = db.Column(db.String(250), nullable=True)
    
    # 2. AVA Submission
    ava_name_location = db.Column(db.String(200), nullable=True)
    submission_date = db.Column(db.String(50), nullable=True)
    submitted_to_ava_by = db.Column(db.String(100), nullable=True)
    ava_received_by = db.Column(db.String(100), nullable=True)
    ava_receiving_proof = db.Column(db.String(250), nullable=True)
    cnr_number = db.Column(db.String(100), nullable=True)
    
    # 3. Passport Collection
    passport_collected_from_ava_by = db.Column(db.String(100), nullable=True)
    collection_date = db.Column(db.String(50), nullable=True)
    
    # 4. Passport Delivery to Customer/TA
    delivery_mode = db.Column(db.String(100), nullable=True)
    delivery_tracking_id = db.Column(db.String(100), nullable=True)
    passport_delivered_date = db.Column(db.String(50), nullable=True)
    delivery_proof = db.Column(db.String(250), nullable=True)
    
    # Meta
    status = db.Column(db.String(50), nullable=False, default='Received')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        passports = []
        try:
            passports = json.loads(self.passports_data)
        except:
            passports = []
            
        return {
            'id': self.id,
            'order_id': self.order_id,
            'passports': passports,
            'received_date': self.received_date,
            'received_mode': self.received_mode,
            'received_by': self.received_by,
            'receiving_proof': self.receiving_proof,
            
            'ava_name_location': self.ava_name_location,
            'submission_date': self.submission_date,
            'submitted_to_ava_by': self.submitted_to_ava_by,
            'ava_received_by': self.ava_received_by,
            'ava_receiving_proof': self.ava_receiving_proof,
            'cnr_number': self.cnr_number,
            
            'passport_collected_from_ava_by': self.passport_collected_from_ava_by,
            'collection_date': self.collection_date,
            
            'delivery_mode': self.delivery_mode,
            'delivery_tracking_id': self.delivery_tracking_id,
            'passport_delivered_date': self.passport_delivered_date,
            'delivery_proof': self.delivery_proof,
            
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
