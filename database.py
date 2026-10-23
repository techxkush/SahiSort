import sqlite3
import os
from datetime import datetime, timezone

DB_FILE = os.getenv("DATABASE_URL", "sqlite:///./sahisort.db").replace("sqlite:///", "", 1)

def get_conn():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def utc_iso():
    return datetime.now(timezone.utc).isoformat()

def init_db():
    conn = get_conn()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS discoveries (
            id TEXT PRIMARY KEY,
            input_type TEXT NOT NULL,
            user_description TEXT,
            image_data_url TEXT,
            object_name TEXT NOT NULL,
            short_description TEXT NOT NULL,
            visible_characteristics TEXT NOT NULL,
            materials TEXT NOT NULL,
            uncertainty_notes TEXT NOT NULL,
            clarification_required INTEGER DEFAULT 0,
            questions TEXT NOT NULL,
            clarification_answers TEXT NOT NULL,
            narration_script TEXT NOT NULL,
            status TEXT DEFAULT 'IDENTIFIED',
            disposal_confirmed INTEGER DEFAULT 0,
            disposal_confirmed_at TEXT,
            disposal_confirmed_route TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS disposal_recommendations (
            id TEXT PRIMARY KEY,
            discovery_id TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL,
            disposal_category TEXT NOT NULL,
            reasoning TEXT NOT NULL,
            preparation_instructions TEXT NOT NULL,
            conditions_and_exceptions TEXT NOT NULL,
            uncertainty_or_limitations TEXT NOT NULL,
            general_guidance_note TEXT,
            source_evidence TEXT NOT NULL,
            version INTEGER DEFAULT 1,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS corrections (
            id TEXT PRIMARY KEY,
            discovery_id TEXT NOT NULL,
            previous_object_name TEXT NOT NULL,
            previous_materials TEXT NOT NULL,
            corrected_object_name TEXT NOT NULL,
            corrected_primary_material TEXT NOT NULL,
            user_notes TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS reuse_projects (
            id TEXT PRIMARY KEY,
            discovery_id TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            intended_use TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            estimated_time TEXT NOT NULL,
            required_materials TEXT NOT NULL,
            required_tools TEXT NOT NULL,
            steps TEXT NOT NULL,
            safety_notes TEXT NOT NULL,
            assumptions_or_limitations TEXT NOT NULL,
            is_saved INTEGER DEFAULT 0,
            saved_at TEXT,
            is_completed INTEGER DEFAULT 0,
            completed_at TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS activity_history (
            id TEXT PRIMARY KEY,
            action_type TEXT NOT NULL,
            discovery_id TEXT,
            project_id TEXT,
            summary TEXT NOT NULL,
            created_at TEXT
        );
        """
    )
    conn.commit()
    conn.close()

def log_activity(conn, action_type: str, summary: str, discovery_id=None, project_id=None):
    import uuid
    conn.execute(
        "INSERT INTO activity_history (id, action_type, discovery_id, project_id, summary, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), action_type, discovery_id, project_id, summary, utc_iso())
    )