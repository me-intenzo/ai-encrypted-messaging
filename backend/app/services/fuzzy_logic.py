import numpy as np

class FuzzyDecisionEngine:
    def __init__(self):
        # Optimized fuzzy membership functions
        self.confidence_ranges = {
            'low': (0, 0, 0.4),
            'medium': (0.3, 0.6, 0.85),
            'high': (0.75, 1, 1)
        }
        
        self.spam_ranges = {
            'low': (0, 0, 0.3),
            'medium': (0.2, 0.5, 0.75),
            'high': (0.65, 1, 1)
        }
        
        self.toxic_ranges = {
            'low': (0, 0, 0.25),
            'medium': (0.2, 0.5, 0.75),
            'high': (0.65, 1, 1)
        }
        
        # Fixed fuzzy rules with proper spam blocking
        self.rules = [
            # Block spam with high confidence
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['high']),
                                             self._get_membership(c, self.confidence_ranges['high'])),
             'action': 'blocked', 'weight': 1.0},
            
            # Block toxic content with high confidence
            {'condition': lambda t, s, c: min(self._get_membership(t, self.toxic_ranges['high']),
                                             self._get_membership(c, self.confidence_ranges['high'])),
             'action': 'blocked', 'weight': 1.0},
            
            # Block combined spam and toxic
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['medium']),
                                             self._get_membership(t, self.toxic_ranges['medium']),
                                             self._get_membership(c, self.confidence_ranges['high'])),
             'action': 'blocked', 'weight': 0.9},
            
            # Flag toxic content with medium confidence
            {'condition': lambda t, s, c: min(self._get_membership(t, self.toxic_ranges['medium']),
                                             self._get_membership(c, self.confidence_ranges['medium'])),
             'action': 'flagged', 'weight': 0.8},
            
            # Flag spam with medium confidence
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['medium']),
                                             self._get_membership(c, self.confidence_ranges['medium'])),
             'action': 'flagged', 'weight': 0.7},
            
            # Allow clean content with higher priority
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['low']),
                                             self._get_membership(t, self.toxic_ranges['low'])),
             'action': 'allowed', 'weight': 1.5},
            
            # Allow any message with low spam and toxic probabilities
            {'condition': lambda t, s, c: max(self._get_membership(s, self.spam_ranges['low']),
                                             self._get_membership(t, self.toxic_ranges['low'])),
             'action': 'allowed', 'weight': 1.0}
        ]
    
    def _triangular_membership(self, x, a, b, c):
        """Calculate triangular membership function"""
        if x <= a or x >= c:
            return 0.0
        elif a < x <= b:
            return (x - a) / (b - a)
        elif b < x < c:
            return (c - x) / (c - b)
        else:
            return 0.0
    
    def _get_membership(self, value, range_tuple):
        """Get membership degree for a value in a fuzzy set"""
        a, b, c = range_tuple
        return self._triangular_membership(value, a, b, c)
    
    def _defuzzify(self, rule_outputs):
        """Fixed defuzzification with proper spam blocking"""
        action_scores = {'allowed': 0, 'flagged': 0, 'blocked': 0}
        
        for rule_strength, action, weight in rule_outputs:
            if rule_strength > 0:
                action_scores[action] = max(action_scores[action], rule_strength * weight)
        
        best_action = max(action_scores, key=action_scores.get)
        best_score = action_scores[best_action]
        
        # Default to allowed for unclear cases
        if best_score < 0.4:
            best_action = 'allowed'
            best_score = 0.6
        
        return best_action, best_score, action_scores
    
    def make_decision(self, ai_result: dict, message_text: str = "") -> dict:
        """Context-aware toxicity detection with proper allow/flag/block"""
        spam_prob = ai_result['probabilities'].get('spam', 0)
        toxic_prob = ai_result['probabilities'].get('toxic', 0)
        confidence = ai_result['confidence']
        classification = ai_result['prediction']
        message_lower = message_text.lower()
        
        # BLOCK: Direct personal attacks
        attack_patterns = [
            ('you are', ['stupid', 'worthless', 'pathetic', 'disgusting', 'idiot', 'moron']),
            ('you\'re', ['such', 'so', 'a complete', 'absolutely', 'stupid', 'worthless']),
            ('nobody', ['likes you', 'cares about you', 'wants you']),
            ('i hate', ['you', 'your']),
            ('you son of', ['bitch', 'bi*ch']),
            ('go', ['die', 'kill yourself'])
        ]
        
        for prefix, suffixes in attack_patterns:
            if prefix in message_lower:
                for suffix in suffixes:
                    if suffix in message_lower:
                        return {
                            'decision': 'blocked',
                            'score': 0.95,
                            'spam_prob': spam_prob,
                            'toxic_prob': toxic_prob,
                            'confidence': confidence
                        }
        
        # BLOCK: High confidence spam
        if classification == 'spam' and confidence > 0.8:
            return {
                'decision': 'blocked',
                'score': 0.9,
                'spam_prob': spam_prob,
                'toxic_prob': toxic_prob,
                'confidence': confidence
            }
        
        # FLAG: Sarcastic/subtle toxicity
        sarcasm_indicators = ['oh wow', 'great job', 'so smart', 'brilliant', 'amazing work']
        if any(indicator in message_lower for indicator in sarcasm_indicators) and toxic_prob > 0.3:
            return {
                'decision': 'flagged',
                'score': 0.7,
                'spam_prob': spam_prob,
                'toxic_prob': toxic_prob,
                'confidence': confidence
            }
        
        # FLAG: AI detected toxicity with medium confidence
        if classification == 'toxic' and confidence > 0.5:
            return {
                'decision': 'flagged',
                'score': 0.8,
                'spam_prob': spam_prob,
                'toxic_prob': toxic_prob,
                'confidence': confidence
            }
        
        # FLAG: High toxicity probability regardless of classification
        if toxic_prob > 0.6:
            return {
                'decision': 'flagged',
                'score': 0.75,
                'spam_prob': spam_prob,
                'toxic_prob': toxic_prob,
                'confidence': confidence
            }
        
        # ALLOW: Clear legitimate messages
        safe_greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'thanks', 'thank you']
        if any(greeting in message_lower for greeting in safe_greetings) and toxic_prob < 0.2:
            return {
                'decision': 'allowed',
                'score': 0.9,
                'spam_prob': spam_prob,
                'toxic_prob': toxic_prob,
                'confidence': confidence
            }
        
        # ALLOW: Ham classification with low toxicity
        if classification == 'ham' and toxic_prob < 0.3 and spam_prob < 0.3:
            return {
                'decision': 'allowed',
                'score': 0.8,
                'spam_prob': spam_prob,
                'toxic_prob': toxic_prob,
                'confidence': confidence
            }
        
        # DEFAULT: Flag uncertain cases
        return {
            'decision': 'flagged',
            'score': 0.5,
            'spam_prob': spam_prob,
            'toxic_prob': toxic_prob,
            'confidence': confidence
        }

fuzzy_engine = FuzzyDecisionEngine()

def evaluate_message(message: str, ai_result: dict) -> dict:
    """Improved evaluation with better thresholds"""
    fuzzy_result = fuzzy_engine.make_decision(ai_result, message)
    
    return {
        'status': fuzzy_result['decision'],
        'fuzzy_score': fuzzy_result['score'],
        'ai_analysis': {
            'spam_probability': fuzzy_result['spam_prob'],
            'toxicity_probability': fuzzy_result['toxic_prob'],
            'confidence': fuzzy_result['confidence'],
            'classification': ai_result['prediction']
        }
    }