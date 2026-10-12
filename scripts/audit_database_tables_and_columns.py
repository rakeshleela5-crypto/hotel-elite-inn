import os
import re

backend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn-backend-api"
models_py = os.path.join(backend_dir, "models.py")

with open(models_py, "r", encoding="utf-8") as f:
    models_code = f.read()

# Extract table names and columns from models.py
models_tables = {}
current_class = None
current_table = None

for line in models_code.split("\n"):
    class_m = re.match(r'class\s+([a-zA-Z0-9_]+)\s*\(\s*Base\s*\):', line)
    if class_m:
        current_class = class_m.group(1)
        current_table = None
        continue
    if current_class:
        tbl_m = re.match(r'\s*__tablename__\s*=\s*["\']([^"\']+)["\']', line)
        if tbl_m:
            current_table = tbl_m.group(1)
            models_tables[current_table] = []
            continue
        col_m = re.match(r'\s*([a-zA-Z0-9_]+)\s*=\s*Column\(', line)
        if col_m and current_table:
            models_tables[current_table].append(col_m.group(1))

print(f"Total tables in models.py: {len(models_tables)}")

# Now scan alembic migrations
alembic_dir = os.path.join(backend_dir, "alembic", "versions")
migration_tables = {}
migration_added_cols = {}

for mf in sorted(os.listdir(alembic_dir)):
    if not mf.endswith(".py"): continue
    path = os.path.join(alembic_dir, mf)
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
    
    # Tables created: op.create_table('table_name', ...)
    created = re.findall(r'op\.create_table\(\s*[\'"]([^\'"]+)[\'"]', code)
    for t in created:
        migration_tables[t] = mf
    
    # Columns added: op.add_column('table_name', sa.Column('col_name', ...))
    added = re.findall(r'op\.add_column\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*sa\.Column\(\s*[\'"]([^\'"]+)[\'"]', code)
    for t, c in added:
        if t not in migration_added_cols:
            migration_added_cols[t] = []
        migration_added_cols[t].append((c, mf))

print(f"Total tables created in migrations: {len(migration_tables)}")

missing_tables = [t for t in models_tables if t not in migration_tables]
print(f"Tables in models.py missing from migrations: {len(missing_tables)}")
for t in missing_tables:
    print(f"  Missing Table: {t}")

# Check columns for bookings table
booking_cols_model = set(models_tables.get("bookings", []))
print(f"\nBookings columns in models.py: {len(booking_cols_model)}")
print("Columns added to bookings via migrations:")
for c, mf in migration_added_cols.get("bookings", []):
    print(f"  + {c} (in {mf})")

# Also check seed scripts or sql scripts for any table references
for root, dirs, files in os.walk(backend_dir):
    for f in files:
        if f.endswith(".sql"):
            fpath = os.path.join(root, f)
            with open(fpath, "r", encoding="utf-8") as s:
                sql_content = s.read()
            inserts = re.findall(r'INSERT\s+INTO\s+([a-zA-Z0-9_]+)', sql_content, re.IGNORECASE)
            for ins in set(inserts):
                if ins not in models_tables and ins != "alembic_version":
                    print(f"  SQL file {f} inserts into non-model table: {ins}")
