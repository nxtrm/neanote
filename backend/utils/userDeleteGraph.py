import psycopg2
import os
import sys
from psycopg2 import extras
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from config import Config
import psycopg2
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt

# Adjacency matrix
adj_matrix = np.array([
    [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
])


# Add node labels based on your table names
node_labels = {
    0: "users",
    1: "taskstatistics",
    2: "notes",
    3: "tags",
    4: "goals",
    5: "goalhistory",
    6: "milestones",
    7: "habits",
    8: "habitcompletion",
    9: "habittasks",
    10: "tasks",
    11: "subtasks",
    12: "notetags",
}
G = nx.from_numpy_array(adj_matrix)

# Relabel nodes
G = nx.relabel_nodes(G, node_labels)

# Draw the graph
plt.figure(figsize=(12, 8))
pos = nx.spring_layout(G)  # positions for all nodes
nx.draw(G, pos, with_labels=True, node_size=3000, node_color="skyblue", font_size=10, font_weight="bold", edge_color="gray")
plt.title("Graph Visualization from Adjacency Matrix")
plt.show()

conn = psycopg2.connect(
    host="localhost",
    database=Config.database,
    user=Config.user,
    password=Config.password,
    port=Config.port
)
#For testing purposes

def delete_user_notes(conn, userId):

    with conn.cursor() as cur:
        cur.execute(
            '''DELETE FROM notes WHERE user_id = %s''',
            (userId,)
        )
        conn.commit()

def collect_notes(conn, userId):
    with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute(
            '''SELECT id, type FROM notes WHERE user_id = %s''',
            (userId,)
        )
        notes = cur.fetchall()
        for note in notes:
            if note['type'] == 'task':
                cur.execute(
                    '''SELECT id FROM tasks WHERE note_id = %s''',
                    (note['id'],)
                )
                task = cur.fetchone()
                if(task):
                    cur.execute(
                        '''SELECT id from subtasks WHERE task_id = %s''', (task['id'],)
                    )
                    subtasks = cur.fetchall()

            elif note['type'] == 'habit':
                cur.execute(
                    '''SELECT id FROM habits WHERE note_id = %s''',
                (note['id'],)
                )
                habit = cur.fetchone()
                if(habit):
                    cur.execute(
                        '''SELECT id from habitcompletion WHERE habit_id = %s''', (habit['id'],)
                    )
                    completions = cur.fetchall()
                    cur.execute(
                        '''SELECT * from habittasks WHERE habit_id = %s''', (habit['id'],)
                    )
                    habittasks = cur.fetchall()
            elif note['type'] == 'goal':
                cur.execute(
                    '''SELECT id FROM goals WHERE note_id = %s''',
                    (note['id'],)
                )
                goal = cur.fetchone()
                if(goal):
                    cur.execute(
                        '''SELECT id from goalhistory WHERE goal_id = %s''', (goal['id'],)
                    )
                    goalhistory = cur.fetchall()
                    cur.execute(
                        '''SELECT id from milestones WHERE goal_id = %s''', (goal['id'],)
                    )
                    milestones = cur.fetchall()
        return notes
    
# print(collect_notes(conn, '45fd1698-c28b-46a3-9263-619db9df8e2e'))