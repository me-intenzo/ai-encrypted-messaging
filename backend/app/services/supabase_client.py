try:
    from supabase import create_client, Client
except ImportError:
    # Fallback for compatibility issues
    import requests
    import json
    
    class MockClient:
        def __init__(self, url, key):
            self.url = url
            self.key = key
            self.headers = {
                'apikey': key,
                'Authorization': f'Bearer {key}',
                'Content-Type': 'application/json'
            }
        
        def table(self, table_name):
            return MockTable(self.url, table_name, self.headers)
    
    class MockTable:
        def __init__(self, url, table_name, headers):
            self.url = f"{url}/rest/v1/{table_name}"
            self.headers = headers
            self.query_params = {}
        
        def insert(self, data):
            response = requests.post(self.url, json=data, headers=self.headers)
            return MockResponse([data])
        
        def select(self, columns="*"):
            self.query_params['select'] = columns
            return self
        
        def eq(self, column, value):
            self.query_params[column] = f'eq.{value}'
            return self
        
        def order(self, column, desc=False):
            order_val = f'{column}.desc' if desc else column
            self.query_params['order'] = order_val
            return self
        
        def execute(self):
            response = requests.get(self.url, params=self.query_params, headers=self.headers)
            data = response.json() if response.status_code == 200 else []
            return MockResponse(data)
    
    class MockResponse:
        def __init__(self, data):
            self.data = data
    
    def create_client(url, key):
        return MockClient(url, key)
    
    Client = MockClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)
    
    async def save_message(self, message_data: dict) -> dict:
        try:
            result = self.supabase.table('messages').insert(message_data).execute()
            return result.data[0]
        except Exception as e:
            raise Exception(f"Failed to save message: {str(e)}")
    
    async def get_messages(self, user_id: str, chat_partner_id: str) -> list:
        try:
            # Query messages where user is sender and chat_partner is recipient
            result1 = self.supabase.table('messages').select("*") \
                .eq('sender_id', user_id).eq('recipient_id', chat_partner_id) \
                .order('created_at').execute()
            # Query messages where user is recipient and chat_partner is sender
            result2 = self.supabase.table('messages').select("*") \
                .eq('sender_id', chat_partner_id).eq('recipient_id', user_id) \
                .order('created_at').execute()
            # Combine and sort all messages
            all_msgs = (result1.data or []) + (result2.data or [])
            all_msgs.sort(key=lambda x: x.get('created_at'))
            return all_msgs
        except Exception as e:
            raise Exception(f"Failed to get messages: {str(e)}")
    
    async def get_user_chats(self, user_id: str) -> list:
        try:
            # Get chats where user is sender
            result1 = self.supabase.table('messages').select(
                "sender_id, recipient_id, created_at"
            ).eq('sender_id', user_id).order('created_at', desc=True).execute()
            # Get chats where user is recipient
            result2 = self.supabase.table('messages').select(
                "sender_id, recipient_id, created_at"
            ).eq('recipient_id', user_id).order('created_at', desc=True).execute()
            # Get unique chat partners
            partners = set()
            for msg in (result1.data or []):
                if msg['recipient_id'] != user_id:
                    partners.add(msg['recipient_id'])
            for msg in (result2.data or []):
                if msg['sender_id'] != user_id:
                    partners.add(msg['sender_id'])
            return list(partners)
        except Exception as e:
            raise Exception(f"Failed to get user chats: {str(e)}")
    
    async def create_user(self, user_data: dict) -> dict:
        try:
            result = self.supabase.table('users').insert(user_data).execute()
            return result.data[0]
        except Exception as e:
            raise Exception(f"Failed to create user: {str(e)}")
    
    async def get_user_by_email(self, email: str) -> dict:
        try:
            result = self.supabase.table('users').select("*").eq('email', email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            return None
    
    async def get_user_by_username(self, username: str) -> dict:
        try:
            result = self.supabase.table('users').select("*").eq('username', username).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            return None
    
    async def get_user_by_id(self, user_id: str) -> dict:
        try:
            result = self.supabase.table('users').select("*").eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            return None
    
    async def update_user(self, user_id: str, update_data: dict) -> dict:
        try:
            result = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
            return result.data[0]
        except Exception as e:
            raise Exception(f"Failed to update user: {str(e)}")
    
    async def create_auth_user(self, email: str, password: str, username: str) -> dict:
        """Create user with Supabase Auth"""
        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "username": username
                    },
                    "email_redirect_to": None  # Disable email confirmation for dev
                }
            })
            
            if response.user:
                user_data = {
                    "id": response.user.id,
                    "email": email,
                    "username": username,
                    "is_verified": True  # Auto-verify when email confirmation disabled
                }
                
                self.supabase.table('users').insert(user_data).execute()
                
                return {
                    "success": True,
                    "user_id": response.user.id,
                    "message": "Registration successful. Check email for verification."
                }
            else:
                return {"success": False, "message": "Registration failed"}
                
        except Exception as e:
            error_msg = str(e)
            if "already registered" in error_msg.lower():
                return {"success": False, "message": "Email already registered"}
            return {"success": False, "message": f"Registration failed: {error_msg}"}
    
    async def login_auth_user(self, email: str, password: str) -> dict:
        """Login with Supabase Auth"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                user_data = self.supabase.table('users').select("username").eq('id', response.user.id).execute()
                username = user_data.data[0]["username"] if user_data.data else None
                
                return {
                    "success": True,
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "username": username,
                    "message": "Login successful"
                }
            else:
                return {"success": False, "message": "Invalid credentials"}
                
        except Exception as e:
            error_msg = str(e)
            if "invalid" in error_msg.lower():
                return {"success": False, "message": "Invalid email or password"}
            elif "not confirmed" in error_msg.lower():
                return {"success": False, "message": "Please verify your email first"}
            return {"success": False, "message": f"Login failed: {error_msg}"}
    
    async def save_feedback(self, feedback_data: dict) -> dict:
        try:
            result = self.supabase.table('message_feedback').insert(feedback_data).execute()
            return result.data[0]
        except Exception as e:
            raise Exception(f"Failed to save feedback: {str(e)}")
    
    async def get_message_by_id(self, message_id: str) -> dict:
        try:
            result = self.supabase.table('messages').select("*").eq('id', message_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            return None
    
    async def get_recent_feedback(self, user_id: str, hours: int = 1) -> list:
        try:
            from datetime import datetime, timedelta
            cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
            result = self.supabase.table('message_feedback').select("*").eq('user_id', user_id).gte('created_at', cutoff_time).execute()
            return result.data or []
        except Exception as e:
            return []

supabase_service = SupabaseService()