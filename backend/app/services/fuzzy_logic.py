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
        
        # Simplified and effective fuzzy rules
        self.rules = [
            # Block only extreme cases
            {'condition': lambda t, s, c: min(self._get_membership(t, self.toxic_ranges['high']),
                                             self._get_membership(c, self.confidence_ranges['high'])),
             'action': 'blocked', 'weight': 1.0},
            
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['high']),
                                             self._get_membership(t, self.toxic_ranges['medium']),
                                             self._get_membership(c, self.confidence_ranges['high'])),
             'action': 'blocked', 'weight': 0.9},
            
            # Flag suspicious content
            {'condition': lambda t, s, c: min(self._get_membership(t, self.toxic_ranges['medium']),
                                             self._get_membership(c, self.confidence_ranges['high'])),
             'action': 'flagged', 'weight': 0.8},
            
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['high']),
                                             self._get_membership(c, self.confidence_ranges['medium'])),
             'action': 'flagged', 'weight': 0.7},
            
            # Allow safe content
            {'condition': lambda t, s, c: min(self._get_membership(s, self.spam_ranges['low']),
                                             self._get_membership(t, self.toxic_ranges['low'])),
             'action': 'allowed', 'weight': 1.0},
            
            {'condition': lambda t, s, c: self._get_membership(c, self.confidence_ranges['high']),
             'action': 'allowed', 'weight': 0.6}
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
        """Optimized defuzzification"""
        action_scores = {'allowed': 0, 'flagged': 0, 'blocked': 0}
        
        for rule_strength, action, weight in rule_outputs:
            if rule_strength > 0:
                action_scores[action] = max(action_scores[action], rule_strength * weight)
        
        best_action = max(action_scores, key=action_scores.get)
        best_score = action_scores[best_action]
        
        # Default to allowed if no strong signal
        if best_score < 0.5:
            best_action = 'allowed'
            best_score = 0.5
        
        return best_action, best_score, action_scores
    
    def make_decision(self, ai_result: dict, message_text: str = "") -> dict:
        """Optimized fuzzy inference"""
        spam_prob = ai_result['probabilities'].get('spam', 0)
        toxic_prob = ai_result['probabilities'].get('toxic', 0)
        confidence = ai_result['confidence']
        
        # Apply rules
        rule_outputs = [(rule['condition'](toxic_prob, spam_prob, confidence),
                        rule['action'], rule['weight']) for rule in self.rules]
        
        # Get decision
        decision, score, all_scores = self._defuzzify(rule_outputs)
        
        return {
            'decision': decision,
            'score': score,
            'spam_prob': spam_prob,
            'toxic_prob': toxic_prob,
            'confidence': confidence
        }

fuzzy_engine = FuzzyDecisionEngine()

def evaluate_message(message: str, ai_result: dict) -> dict:
    """Main evaluation function"""
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