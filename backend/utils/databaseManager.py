import psycopg2
class DatabaseManager:
    def __init__(self, conn):
        self.conn = conn

    def fetchall_query(self, query, params=None):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def fetchone_query(self, query, params=None):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(query, params)
            return cur.fetchone()

    def execute_query(self, query, params=None, fetch=False):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(query, params)
            if fetch:
                return cur.fetchall()
            return None

    def execute_returning_query(self, query, params=None):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(query, params)
            return cur.fetchone()

    def executemany_query(self, query, params, fetch=False):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.executemany(query, params)
            if fetch:
                return cur.fetchall()
            return None

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()