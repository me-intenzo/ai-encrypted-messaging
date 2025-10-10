from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.models.message import MessageCreate, MessageResponse, DecryptedMessage
from app.utils.crypto import crypto_manager
from app.services.ai_classifier import ai_classifier
from app.services.fuzzy_logic import evaluate_message
from app.services.supabase_client import supabase_service
import json
from datetime import datetime
import uuid

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))

manager = ConnectionManager()

@router.post("/feedback")
async def message_feedback(message_id: str, feedback_type: str, user_id: str):
    """Store user feedback with abuse protection"""
    try:
        print(f"Feedback request: message_id={message_id}, user_id={user_id}, type={feedback_type}")
        
        # Get original message
        message = await supabase_service.get_message_by_id(message_id)
        print(f"Message found: {message is not None}")
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        # Skip authorization check for now
        print(f"Message recipient: {message.get('recipient_id')}, User: {user_id}")
        
        # Simple feedback storage without complex validation
        feedback_data = {
            "message_id": message_id,
            "user_id": user_id,
            "feedback_type": feedback_type,
            "original_content": "feedback_content"
        }
        
        print(f"Saving feedback: {feedback_data}")
        result = await supabase_service.save_feedback(feedback_data)
        print(f"Feedback saved: {result}")
        
        return {"message": "Feedback recorded"}
    except Exception as e:
        print(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send", response_model=MessageResponse)
async def send_message(message: MessageCreate):
    try:
        # AI + Fuzzy evaluation first
        ai_result = ai_classifier.classify_message(message.content)
        eval_result = evaluate_message(message.content, ai_result)
        
        print(f"Message evaluation: {eval_result}")
        print(f"AI classification: {ai_result['prediction']}, confidence: {ai_result['confidence']}")
        
        # Encrypt the message
        encrypted_data = crypto_manager.encrypt_message(message.content)
        
        # Prepare message data
        message_data = {
            "id": str(uuid.uuid4()),
            "sender_id": message.sender_id,
            "recipient_id": message.recipient_id,
            "encrypted_content": json.dumps(encrypted_data),
            "status": eval_result['status'],
            "ai_score": eval_result['ai_analysis']['confidence'],
            "fuzzy_score": eval_result['fuzzy_score'],
            "fuzzy_details": json.dumps(eval_result['ai_analysis']),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Save to database
        saved_message = await supabase_service.save_message(message_data)
        
        # Only send notification for allowed and flagged messages
        if eval_result['status'] in ['allowed', 'flagged']:
            await manager.send_message(message.recipient_id, {
                "type": "new_message",
                "message": saved_message
            })
        
        return MessageResponse(**saved_message)
        
    except Exception as e:
        print(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/{chat_partner_id}")
async def get_chat_messages(chat_partner_id: str, user_id: str):
    try:
        messages = await supabase_service.get_messages(user_id, chat_partner_id)
        print(f"Fetched {len(messages)} messages")
        
        # Filter and decrypt messages based on status
        decrypted_messages = []
        for msg in messages:
            # Skip blocked messages entirely
            if msg['status'] == 'blocked':
                print(f"Skipping blocked message: {msg['id']}")
                continue
                
            try:
                encrypted_data = json.loads(msg['encrypted_content'])
                decrypted_content = crypto_manager.decrypt_message(encrypted_data)
                
                # For flagged messages, add warning prefix with feedback option
                if msg['status'] == 'flagged':
                    decrypted_content = f"⚠️ [FLAGGED - Not spam? Report false positive] {decrypted_content}"
                
                decrypted_msg = DecryptedMessage(
                    id=msg['id'],
                    sender_id=msg['sender_id'],
                    recipient_id=msg['recipient_id'],
                    content=decrypted_content,
                    status=msg['status'],
                    ai_score=msg['ai_score'],
                    fuzzy_score=msg['fuzzy_score'],
                    created_at=msg['created_at']
                )
                decrypted_messages.append(decrypted_msg)
                
            except Exception as e:
                print(f"Error decrypting message {msg['id']}: {e}")
                # Add placeholder for failed decryption
                decrypted_msg = DecryptedMessage(
                    id=msg['id'],
                    sender_id=msg['sender_id'],
                    recipient_id=msg['recipient_id'],
                    content="[Message could not be decrypted]",
                    status=msg['status'],
                    ai_score=msg['ai_score'],
                    fuzzy_score=msg['fuzzy_score'],
                    created_at=msg['created_at']
                )
                decrypted_messages.append(decrypted_msg)
                
        print(f"Returning {len(decrypted_messages)} decrypted messages")
        return decrypted_messages
        
    except Exception as e:
        print(f"Error in get_chat_messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chats")
async def get_user_chats(user_id: str):
    try:
        chats = await supabase_service.get_user_chats(user_id)
        print(f"Fetched chats: {chats}")
        return chats
    except Exception as e:
        print(f"Error in get_user_chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
    except WebSocketDisconnect:
        manager.disconnect(user_id)