import unittest
import os

os.environ["DATABASE_URL"] = "sqlite:///./test_sahisort.db"

from database import init_db, get_conn, log_activity
from evidence_service import EvidenceEngine
from ai_service import SahiSortAIService

class TestSahiSort(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.path.exists("test_sahisort.db"):
            try:
                os.remove("test_sahisort.db")
            except Exception:
                pass
        init_db()

    def test_evidence_and_ai(self):
        ai = SahiSortAIService()
        evidence = EvidenceEngine()
        
        res = ai.identify_object("glass jar")
        self.assertEqual(res["object_name"], "Culinary Glass Jar / Bottle")
        
        eval_res = evidence.evaluate_disposal(res["object_name"], res["short_description"], res["materials"], {})
        self.assertEqual(eval_res["status"], "CONDITIONAL")
        self.assertTrue(len(eval_res["source_evidence"]) > 0)

    def test_database_persistence(self):
        conn = get_conn()
        log_activity(conn, "TEST_ACTION", "Testing persistence")
        conn.commit()
        row = conn.execute("SELECT * FROM activity_history WHERE action_type = 'TEST_ACTION'").fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row["summary"], "Testing persistence")
        conn.close()

if __name__ == "__main__":
    unittest.main()