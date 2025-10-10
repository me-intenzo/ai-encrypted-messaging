from datetime import datetime, timedelta
from app.services.supabase_client import supabase_service

class FeedbackProtection:
    @staticmethod
    async def validate_feedback(user_id: str, message_id: str, feedback_type: str, content: str) -> dict:
        # Rate limiting: max 3 feedback per user per hour
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_feedback = await supabase_service.get_recent_feedback(user_id, one_hour_ago)
        
        if len(recent_feedback) >= 3:
            return {"valid": False, "reason": "Rate limit exceeded"}
        
        # Block feedback on obviously toxic content
        toxic_keywords = ['hate', 'stupid', 'idiot', 'worthless', 'kill', 'die', 'bitch']
        if feedback_type == 'false_positive':
            content_lower = content.lower()
            if any(word in content_lower for word in toxic_keywords):
                return {"valid": False, "reason": "Suspicious content"}
        
        return {"valid": True}

feedback_protection = FeedbackProtection()