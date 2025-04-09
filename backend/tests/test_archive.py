import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import os
from flask import Flask

# Add the parent directory to the path to import the module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from modules.archive import archive_routes

class TestArchiveRoutes(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['JWT_SECRET_KEY'] = 'test-key'

        # Mock database connection and cursor
        self.mock_conn = MagicMock()
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value = self.mock_cursor

        # Set up the routes
        archive_routes(self.app, self.mock_conn, MagicMock())

        # Create test client
        self.client = self.app.test_client()

        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    def test_archive_note(self):
        with patch('modules.archive.g', userId=123):
            # Make a request to archive a note
            response = self.client.put(
                '/api/notes/archive',
                data=json.dumps({'noteId': 456}),
                content_type='application/json'
            )

            # Verify that the cursor executed the right SQL
            self.mock_cursor.execute.assert_called_with(
                "UPDATE Notes SET archived = TRUE WHERE id = %s AND user_id = %s",
                (456, 123)
            )

            # Verify that commit was called
            self.mock_conn.commit.assert_called_once()

            # Check the response
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data['message'], 'Note archived successfully')

    def test_archive_note_exception(self):
        self.mock_cursor.execute.side_effect = Exception("Database error")

        with patch('modules.archive.g', userId=123):
            # Test exception handling
            with self.assertRaises(Exception):
                # Make a request to archive a note
                response = self.client.put(
                    '/api/notes/archive',
                    data=json.dumps({'noteId': 456}),
                    content_type='application/json'
                )

            # Verify rollback was called
            self.mock_conn.rollback.assert_called_once()

    def test_restore_note(self):
        with patch('modules.archive.g', userId=123):
            # Make a request to restore a note
            response = self.client.put(
                '/api/notes/restore',
                data=json.dumps({'noteId': 456}),
                content_type='application/json'
            )

            self.mock_cursor.execute.assert_called_with(
                "UPDATE Notes SET archived = FALSE WHERE id = %s AND user_id = %s",
                (456, 123)
            )

            # Verify that commit was called
            self.mock_conn.commit.assert_called_once()

            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data['message'], 'Note restored successfully')

    def test_restore_note_exception(self):
        # Make the cursor.execute raise an exception
        self.mock_cursor.execute.side_effect = Exception("Database error")

        with patch('modules.archive.g', userId=123):
            # Test exception handling
            with self.assertRaises(Exception):
                response = self.client.put(
                    '/api/notes/restore',
                    data=json.dumps({'noteId': 456}),
                    content_type='application/json'
                )

            self.mock_conn.rollback.assert_called_once()

    @patch('modules.archive.process_universal_notes')
    @patch('psycopg2.extras.DictCursor')
    def test_get_all_archived_notes(self, mock_dict_cursor, mock_process):
        # Setup mocking
        self.mock_conn.cursor.return_value = self.mock_cursor
        self.mock_cursor.fetchone.return_value = {'total': 5}
        self.mock_cursor.fetchall.return_value = [{'mock': 'data'}]

        mock_process.return_value = [
            {'id': 1, 'title': 'Note 1'},
            {'id': 2, 'title': 'Note 2'}
        ]

        with patch('modules.archive.g', userId=123):

            response = self.client.get('/api/notes/archive?pageParam=1&per_page=10')
            self.mock_cursor.execute.assert_called()

            # Check the response
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data['message'], 'Archived notes retrieved successfully')
            self.assertIn('data', data)
            self.assertIn('pagination', data)
            self.assertEqual(data['pagination']['page'], 1)
            self.assertEqual(data['pagination']['perPage'], 10)

    @patch('modules.archive.process_universal_notes')
    @patch('psycopg2.extras.DictCursor')
    def test_get_all_archived_notes_with_next_page(self, mock_dict_cursor, mock_process):
        self.mock_conn.cursor.return_value = self.mock_cursor
        self.mock_cursor.fetchone.return_value = {'total': 15}
        self.mock_cursor.fetchall.return_value = [{'mock': 'data'}]

        # Setup process_universal_notes to return more notes than per_page
        mock_process.return_value = [
            {'id': i, 'title': f'Note {i}'} for i in range(1, 12)  # 11 notes (per_page + 1)
        ]

        # Mock Flask's g object to provide userId
        with patch('modules.archive.g', userId=123):
            # Make a request to get all archived notes
            response = self.client.get('/api/notes/archive?pageParam=1&per_page=10')

            # Check pagination
            data = json.loads(response.data)
            self.assertEqual(data['pagination']['nextPage'], 2)
            self.assertEqual(len(data['data']), 10)

    @patch('modules.archive.process_universal_notes')
    @patch('psycopg2.extras.DictCursor')
    def test_get_all_archived_notes_exception(self, mock_dict_cursor, mock_process):
        self.mock_cursor.execute.side_effect = Exception("Database error")
        with patch('modules.archive.g', userId=123):
            with self.assertRaises(Exception):
                # Make a request to get all archived notes
                response = self.client.get('/api/notes/archive')

            self.mock_conn.rollback.assert_called_once()

if __name__ == '__main__':
    unittest.main()
