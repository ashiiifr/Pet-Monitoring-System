import sqlite3
import os
from werkzeug.security import generate_password_hash

DATABASE = 'pet_health.db'

def seed_data():
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    # Recreate tables (schema from app.py)
    c.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'owner',
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            pet_type TEXT DEFAULT 'dog',
            breed TEXT,
            age_years REAL,
            weight_kg REAL,
            gender TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );
    ''')

    # 1. Create Vet Admin
    vet_pw = generate_password_hash('vet123')
    c.execute("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
              ('vet@clinic.com', vet_pw, 'Dr. Sarah Smith', 'vet'))
    print("Created Vet: Dr. Sarah Smith")

    # 2. Create Pet Owner
    owner_pw = generate_password_hash('demo123')
    c.execute("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
              ('demo@petowner.com', owner_pw, 'John Doe', 'owner'))
    owner_id = c.lastrowid
    print(f"Created Owner: John Doe (ID: {owner_id})")

    # 3. Create Premium Pets
    pets = [
        ('Max', 'dog', 'Golden Retriever', 4.5, 32.0, 'Male'),
        ('Luna', 'cat', 'Siamese', 2.0, 4.2, 'Female'),
        ('Rocky', 'dog', 'French Bulldog', 3.0, 12.5, 'Male')
    ]

    for name, ptype, breed, age, weight, gender in pets:
        c.execute('''INSERT INTO pets (owner_id, name, pet_type, breed, age_years, weight_kg, gender) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (owner_id, name, ptype, breed, age, weight, gender))
        print(f"Created Pet: {name} ({breed})")

    conn.commit()
    conn.close()
    print("\n[OK] Database seeded successfully!")

if __name__ == '__main__':
    seed_data()
