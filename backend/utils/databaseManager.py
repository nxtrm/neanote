import psycopg2
class DatabaseManager:
    def __init__(self, conn):
        self.conn = conn

    def fetchall_query(self, query, params):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def fetchone_query(self, query, params):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(query, params)
            return cur.fetchone()

    def executemany_query(self, query, params):
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.executemany(query, params)
            return cur.fetchall()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()