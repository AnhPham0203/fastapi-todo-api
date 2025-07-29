# sql_app/firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Khởi tạo Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json") # Đường dẫn đến file key
firebase_admin.initialize_app(cred)

# Tạo các đối tượng để dễ dàng truy cập
db = firestore.client()
firebase_auth = auth