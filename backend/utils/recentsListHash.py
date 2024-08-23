class ListNode:
    def __init__(self, note_id):
        self.note_id = note_id
        self.prev = None
        self.next = None

class RecentlyAccessedNotes:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0
        self.max_size = 5

    def add(self, note_id):
        new_node = ListNode(note_id)
        if not self.head:
            self.head = self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node

        if self.size == self.max_size:
            self.remove_last()
        else:
            self.size += 1

    def remove_last(self):
        if self.tail:
            if self.tail.prev:
                self.tail = self.tail.prev
                self.tail.next = None
            else:
                self.head = self.tail = None
            self.size -= 1

    def remove(self, note_id):
        current = self.head
        while current:
            if current.note_id == note_id:
                if current.prev:
                    current.prev.next = current.next
                if current.next:
                    current.next.prev = current.prev
                if current == self.head:
                    self.head = current.next
                if current == self.tail:
                    self.tail = current.prev
                self.size -= 1
                break
            current = current.next

class RecentNotesManager:
    def __init__(self):
        self.user_notes = {}

    def add_note_for_user(self, user_id, note_id):
        if user_id not in self.user_notes:
            self.user_notes[user_id] = RecentlyAccessedNotes()
        user_notes = self.user_notes[user_id]
        user_notes.remove(note_id)  # Remove if it already exists to update its position
        user_notes.add(note_id)

    def get_recent_notes_for_user(self, user_id):
        if user_id in self.user_notes:
            notes = []
            current = self.user_notes[user_id].head
            while current:
                notes.append(current.note_id)
                current = current.next
            return notes
        return []

