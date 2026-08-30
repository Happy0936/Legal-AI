import random

# File to save the generated SQL queries
output_file = "seed_legal_questions.sql"

# Example seed data for random generation
titles = [
    "What are the legal consequences of {}?",
    "How does {} affect an individual's rights?",
    "What steps should be taken in the case of {}?",
    "Explain the legal procedure for {}.",
    "What penalties exist under the law for {}?"
]

scenarios = [
    "theft of property",
    "breach of contract",
    "cybersecurity breaches",
    "workplace harassment",
    "intellectual property disputes",
    "domestic violence cases",
    "traffic rule violations",
    "tax evasion",
    "consumer fraud",
    "environmental violations"
]

details = [
    "Provide detailed steps and references to applicable laws.",
    "Discuss relevant sections of the IPC and other legal statutes.",
    "Include case studies and precedents where applicable.",
    "Outline the jurisdictional challenges and solutions.",
    "Explain how the judiciary addresses such cases."
]

# Open the file to write SQL queries
with open(output_file, "w") as f:
    f.write("-- SQL queries to seed the legal_questions table\n")
    f.write("-- Ensure the table is created before running these queries\n\n")

    # Generate 1000 SQL INSERT statements
    for i in range(1000):
        title = random.choice(titles).format(random.choice(scenarios))
        content = random.choice(details)
        
        # Escape single quotes for SQL compatibility
        title = title.replace("'", "''")
        content = content.replace("'", "''")
        
        # Write the SQL query
        sql_query = f"INSERT INTO legal_questions (title, content) VALUES ('{title}', '{content}');\n"
        f.write(sql_query)

print(f"Generated 1000 SQL queries in {output_file}")
