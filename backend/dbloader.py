import sqlite3
import csv

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Define the table structure
# Adjust the columns and types to match your CSV file's structure
# cursor.execute('''
#     CREATE TABLE IF NOT EXISTS data (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         name TEXT,
#         age INTEGER,
#         email TEXT
#     )
# ''')
# conn.commit()

# Load CSV data into SQLite database
def load_csv_to_db(csv_file):
    with open(csv_file, 'r', encoding='utf-8', errors='ignore') as file:
        # Use csv.reader to read the file
        reader = csv.reader(file)
        headers = next(reader)  # Skip header row

        # Insert data into the SQLite table
        for row in reader:
            cursor.execute('''
                INSERT INTO ipc_ipcsections (  description , offense , punishment , section_number)
                VALUES (?, ?, ? , ?)
            ''', row)

    conn.commit()
    print("Data loaded successfully.")

# Provide the CSV file path
csv_file_path = 'ipc_sections.csv'  # Replace with your CSV file path
load_csv_to_db(csv_file_path)

# Verify that data was loaded correctly
cursor.execute("SELECT * FROM ipc_ipcsections")
rows = cursor.fetchall()
for row in rows:
    print(row)

# Close the connection
conn.close()
