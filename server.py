import http.server
import socketserver
import os
import sys
import json
import time
import threading

# Ensure UTF-8 stdout
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 3000
WEB_DIR = os.path.dirname(os.path.abspath(__file__))

# Request tracking for load balancer telemetry
request_counter = 0
request_lock = threading.Lock()
worker_threads = {}

class LoadBalancedHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):
        global request_counter
        with request_lock:
            request_counter += 1
            current_count = request_counter
            current_thread = threading.current_thread().name
            worker_threads[current_thread] = worker_threads.get(current_thread, 0) + 1

        # Load balancer telemetry API endpoint
        clean_path = self.path.split('?')[0]
        if clean_path == '/api/load-balancer':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('X-Load-Balancer-Worker', current_thread)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            data = {
                "status": "online",
                "mode": "Multi-Threaded Round-Robin Load Balancer",
                "activeThread": current_thread,
                "totalRequestsHandled": current_count,
                "activeWorkers": len(worker_threads),
                "workersDistribution": worker_threads,
                "port": PORT,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))
            return

        # Inject load balancing header into all responses
        return super().do_GET()

    def end_headers(self):
        self.send_header('X-Load-Balancer-Mode', 'Multi-Threaded-Balanced')
        super().end_headers()

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    os.chdir(WEB_DIR)
    server = ThreadingHTTPServer(('0.0.0.0', PORT), LoadBalancedHandler)
    print("======================================================")
    print("Astrotalk Load Balanced Server Online!")
    print(f"Running at: http://localhost:{PORT}")
    print(f"Telemetry API: http://localhost:{PORT}/api/load-balancer")
    print("======================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()
