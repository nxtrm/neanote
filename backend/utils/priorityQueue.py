# modules/tokenization.py

import threading
import heapq
import time
from dataclasses import dataclass, field
from typing import Any, Callable, List, Tuple
from utils.word2vec import load_or_train_model, combine_strings_to_vector
import psycopg2

@dataclass(order=True)
class TokenizationTask:
    priority: int
    note_id: str = field(compare=False)
    text: List[str] = field(compare=False)
    callback: Callable[[Any], None] = field(compare=False, default=None)
    args: Tuple = field(compare=False, default=())
    # kwargs: dict = field(compare=False, default_factory=dict)

class TokenizationTaskManager:
    def __init__(self, db_config, model):
        self.db_config = db_config  # Database configuration dict
        self.model = model
        self.task_queue: List[TokenizationTask] = []
        self.task_counter = 0
        self.lock = threading.Lock()
        self.new_task_event = threading.Event()
        self.running = True
        self.worker_thread = threading.Thread(target=self.process_tasks, daemon=True)
        self.worker_thread.start()

    def connect_db(self):
        conn = psycopg2.connect(
            host=self.db_config.host,
            database=self.db_config.database,
            user=self.db_config.user,
            password=self.db_config.password,
            port=self.db_config.port
        )
        return conn
    
    def delete_note_by_id(self, note_id: str):
        with self.lock:
            self.task_queue = [note for note in self.task_queue if note.note_id != note_id]
            heapq.heapify(self.task_queue)

    def add_note(self, text: List[str], note_id:str, priority: int = 10, callback: Callable[[Any], None] = None):
        with self.lock:
            self.task_queue = [note for note in self.task_queue if note.note_id != note_id]
            heapq.heapify(self.task_queue)

            note = TokenizationTask(priority, note_id, text, callback , self.task_counter)
            heapq.heappush(self.task_queue, note)
            print(self.task_queue)
            self.task_counter += 1
            self.new_task_event.set()

    def process_tasks(self):
        # Establish a separate database connection for this thread
        conn = self.connect_db()
        model = self.model
        while self.running:
            self.new_task_event.wait()
            while True:
                with self.lock:
                    if not self.task_queue:
                        self.new_task_event.clear()
                        break
                    note = heapq.heappop(self.task_queue)
                # Process
                try:
                    vector = self.tokenize_text(note.text, model)
                    if note.callback:
                        note.callback(vector, note, conn,)
                    else:
                        self.default_callback(vector, note, conn,)
                except Exception as e:
                    print(f"Error processing note {note.note_id}: {e}")
            # Sleep briefly to avoid a tight loop
            time.sleep(0.1)
        conn.close()

    def tokenize_text(self, text: List[str], model):
        # Utilize the model to tokenize text
        if not isinstance(text, list) or not all(isinstance(item, str) for item in text):
            raise ValueError("text must be a list of strings")
        vector = combine_strings_to_vector(text, model, True)
        return vector

    def default_callback(self, vector, note, conn, ):
        # Default callback if no other callback is provided
        try :
            cur = conn.cursor()
            cur.execute("UPDATE notes SET vector = %s WHERE id = %s", (vector, note.note_id))
            conn.commit()
        except Exception as e:
            print(f"Error updating note {note.note_id}: {e}")
            conn.rollback()

    def stop(self):
        self.running = False
        self.new_task_event.set()
        self.worker_thread.join()
