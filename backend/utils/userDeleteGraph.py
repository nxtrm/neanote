from datetime import time
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
    [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],  # users
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # taskstatistics
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],  # notes
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],  # tags
    [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],  # goals
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],  # goalhistory
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],  # milestones
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],  # habits
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],  # habitcompletion
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],  # habittasks
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],  # tasks
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],  # subtasks
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # notetags
])
# Add node labels
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

def delete_user(conn, userId):
    try:
        adjacency_list = {}
        for i in range(len(adj_matrix)):
            adjacency_list[i] = []
            for j in range(len(adj_matrix[i])):
                if adj_matrix[i][j] == 1:
                    adjacency_list[i].append(j)
        print(adjacency_list)
        root_node = 0  # users

        stack = []
        visited = set()

        def dfs(node):  # Depth First Search
            if node not in visited:
                visited.add(node)
                for neighbor in adjacency_list[node]:
                    dfs(neighbor)
                stack.append(node)
        dfs(root_node)
        stack.reverse()

        if (delete_user_data_with_backoff(conn, userId, stack)):
            print("User data deleted successfully.")
            return True
        else:
            return False
    except Exception as e:
        print(f"Error deleting notes: {e}")
        raise



def delete_user_data_with_backoff(conn, userId, stack, max_retries=3, backoff_time=1):
    retry_queue = []
    retries = 0

    while stack or retry_queue:
        if not stack and retry_queue:
            stack = retry_queue
            retry_queue = []
            retries += 1
            if retries > max_retries:
                print("Max retries reached. Some entries could not be deleted.")
                return False
            time.sleep(backoff_time)  # Backoff before retrying

        node = stack.pop()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                if node == 0:  # users
                    cur.execute('''DELETE FROM users WHERE id = %s''', (userId,))
                elif node == 1:  # taskstatistics
                    cur.execute('''DELETE FROM taskstatistics WHERE user_id = %s''', (userId,))
                elif node == 2:  # notes
                    cur.execute('''DELETE FROM notes WHERE user_id = %s''', (userId,))
                elif node == 3:  # tags
                    cur.execute('''DELETE FROM tags WHERE user_id = %s''', (userId,))
                elif node == 4:  # goals
                    cur.execute('''DELETE FROM goals WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s)''', (userId,))
                elif node == 5:  # goalhistory
                    cur.execute('''DELETE FROM goalhistory WHERE goal_id IN (SELECT id FROM goals WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s))''', (userId,))
                elif node == 6:  # milestones
                    cur.execute('''DELETE FROM milestones WHERE goal_id IN (SELECT id FROM goals WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s))''', (userId,))
                elif node == 7:  # habits
                    cur.execute('''DELETE FROM habits WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s)''', (userId,))
                elif node == 8:  # habitcompletion
                    cur.execute('''DELETE FROM habitcompletion WHERE habit_id IN (SELECT id FROM habits WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s))''', (userId,))
                elif node == 9:  # habittasks
                    cur.execute('''DELETE FROM habittasks WHERE habit_id IN (SELECT id FROM habits WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s))''', (userId,))
                elif node == 10:  # tasks
                    cur.execute('''DELETE FROM tasks WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s)''', (userId,))
                elif node == 11:  # subtasks
                    cur.execute('''DELETE FROM subtasks WHERE task_id IN (SELECT id FROM tasks WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s))''', (userId,))
                elif node == 12:  # notetags
                    cur.execute('''DELETE FROM notetags WHERE note_id IN (SELECT id FROM notes WHERE user_id = %s)''', (userId,))
        except Exception as e:
            print(f"Error deleting node {node}: {e}. Retrying later.")
            retry_queue.append(node)
            continue
    conn.commit()
    return True

def delete_notes_with_backoff(conn, noteId, stack, max_retries=3, backoff_time=1):
    retry_queue = []
    retries = 0

    while stack or retry_queue:
        if not stack and retry_queue:
            stack = retry_queue
            retry_queue = []
            retries += 1
            if retries > max_retries:
                print("Max retries reached. Some entries could not be deleted.")
                return False
            time.sleep(backoff_time)  # Backoff before retrying

        node = stack.pop()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                if node == 2:  # notes
                    cur.execute('''DELETE FROM notes WHERE id = %s''', (noteId,))
                elif node == 4:  # goals
                    cur.execute('''DELETE FROM goals WHERE note_id IN (SELECT id FROM notes WHERE id = %s)''', (noteId,))
                elif node == 5:  # goalhistory
                    cur.execute('''DELETE FROM goalhistory WHERE goal_id IN (SELECT id FROM goals WHERE note_id IN (SELECT id FROM notes WHERE id = %s))''', (noteId,))
                elif node == 6:  # milestones
                    cur.execute('''DELETE FROM milestones WHERE goal_id IN (SELECT id FROM goals WHERE note_id IN (SELECT id FROM notes WHERE id = %s))''', (noteId,))
                elif node == 7:  # habits
                    cur.execute('''DELETE FROM habits WHERE note_id IN (SELECT id FROM notes WHERE id = %s)''', (noteId,))
                elif node == 8:  # habitcompletion
                    cur.execute('''DELETE FROM habitcompletion WHERE habit_id IN (SELECT id FROM habits WHERE note_id IN (SELECT id FROM notes WHERE id = %s))''', (noteId,))
                elif node == 9:  # habittasks
                    cur.execute('''DELETE FROM habittasks WHERE habit_id IN (SELECT id FROM habits WHERE note_id IN (SELECT id FROM notes WHERE id = %s))''', (noteId,))
                elif node == 10:  # tasks
                    cur.execute('''DELETE FROM tasks WHERE note_id IN (SELECT id FROM notes WHERE id = %s)''', (noteId,))
                elif node == 11:  # subtasks
                    cur.execute('''DELETE FROM subtasks WHERE task_id IN (SELECT id FROM tasks WHERE note_id IN (SELECT id FROM notes WHERE id = %s))''', (noteId,))
                elif node == 12:  # notetags
                    cur.execute('''DELETE FROM notetags WHERE note_id IN (SELECT id FROM notes WHERE id = %s)''', (noteId,))
        except Exception as e:
            print(f"Error deleting node {node}: {e}. Retrying later.")
            retry_queue.append(node)
            continue
    conn.commit()
    return True

#For testing purposes
def draw_graph(adj_matrix):
    G = nx.from_numpy_array(adj_matrix)
    # Relabel nodes
    G = nx.relabel_nodes(G, node_labels)
    # Draw the graph
    plt.figure(figsize=(12, 8))
    pos = nx.spring_layout(G)  # positions for all nodes
    nx.draw(G, pos, with_labels=True, node_size=3000, node_color="skyblue", font_size=10, font_weight="bold", edge_color="gray")
    plt.title("Graph Visualization from Adjacency Matrix")
    plt.show()
# draw_graph(adj_matrix)