from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body) if body else {}
            query = data.get('query', '').lower()
            canvas_data = data.get('canvas', {})
            topic = data.get('topic', 'general')

            response_text = generate_tutor_response(query, canvas_data, topic)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            res_payload = json.dumps({"status": "success", "answer": response_text})
            self.wfile.write(res_payload.encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def generate_tutor_response(query, canvas, topic):
    states = canvas.get('states', [])
    transitions = canvas.get('transitions', [])
    has_start = any(s.get('id') == canvas.get('start') for s in states)
    accept_count = sum(1 for s in states if s.get('isAccept'))

    if 'analyze' in query or 'canvas' in query or 'check' in query:
        if not states:
            return "🔍 **Canvas Diagnosis**: Your canvas is currently empty! Add states using the `+ State` tool, set a start state, and add transitions to get started."
        
        feedback = []
        feedback.append(f"• **State Count**: You have created **{len(states)} state(s)** ({accept_count} accepting).")
        
        if not has_start:
            feedback.append("⚠️ **Warning**: No **Start State** is designated. Use the `▶ Set Start` tool to select your initial state.")
        else:
            feedback.append("✅ **Start State**: Configured correctly.")

        if accept_count == 0:
            feedback.append("⚠️ **Warning**: No **Accept States** configured. Every language recognizer needs at least one accept state (unless L = ∅).")
        else:
            feedback.append(f"✅ **Accept States**: {accept_count} state(s) marked as double-circle accept states.")

        feedback.append(f"• **Transitions**: {len(transitions)} transition edge(s) drawn.")
        
        # Check determinism
        det_issues = []
        state_sym_map = {}
        for t in transitions:
            key = (t.get('from'), t.get('symbol'))
            if key in state_sym_map:
                det_issues.append(f"State `{t.get('from')}` has multiple transitions on symbol `{t.get('symbol')}` → makes it an **NFA**.")
            state_sym_map[key] = True

        if det_issues:
            feedback.append("🔀 **Automaton Classification**: This diagram is an **NFA** (Non-deterministic) because:\n" + "\n".join(det_issues))
        else:
            feedback.append("🤖 **Automaton Classification**: This diagram is **Deterministic (DFA)** for the defined transitions.")

        return "\n\n".join(feedback)

    if 'pumping' in query:
        return ("🧪 **Pumping Lemma AI Help**: To prove a language L is non-regular:\n"
                "1. Assume L is regular with pumping length *p*.\n"
                "2. Choose a specific string *s ∈ L* of length ≥ *p* (e.g. s = aᵖbᵖ).\n"
                "3. Consider all splits *s = xyz* with |xy| ≤ *p* and |y| ≥ 1.\n"
                "4. Show that pumping (e.g. i=0 or i=2) produces a string *xyⁱz ∉ L*.\n"
                "5. Conclude contradiction!")

    if 'conversion' in query or 'nfa to dfa' in query:
        return ("🔄 **Subset Construction Help**: Each DFA state represents a *subset* of NFA states.\n"
                "• Start with DFA start state = ε-closure({q₀}).\n"
                "• For each input symbol *a*, compute MOVE(S, a) and take ε-closure.\n"
                "• Any subset containing an NFA accept state becomes a DFA accept state!")

    return ("🤖 **Automata AI Tutor**: I can help you analyze your drawn state diagrams, debug DFA/NFA acceptance, explain Pumping Lemma proofs, or guide you through NFA→DFA conversions!\n\n"
            "Try clicking **'Analyze My Canvas'** or ask a question about Automata Theory.")
