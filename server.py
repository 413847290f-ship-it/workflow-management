import os
import sys
import socket
import webbrowser
from http.server import SimpleHTTPRequestHandler
import socketserver


def find_free_port():
    """Find an available TCP port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def get_base_dir():
    """Return the directory where static files are located.

    When packaged with PyInstaller --onefile, static files added via
    --add-data will be extracted to sys._MEIPASS.
    Otherwise, use the directory of this script.
    """
    if hasattr(sys, "_MEIPASS"):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def start_server(directory: str, port: int):
    os.chdir(directory)
    handler = SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        url = f"http://localhost:{port}/"
        # Try to open default browser
        try:
            webbrowser.open(url)
        except Exception:
            pass
        print(f"Serving '{directory}' at {url}")
        httpd.serve_forever()


def main():
    base_dir = get_base_dir()
    # Basic sanity check: ensure key files exist
    needed = ["index.html", "script.js", "styles.css"]
    missing = [fn for fn in needed if not os.path.exists(os.path.join(base_dir, fn))]
    if missing:
        print("Warning: missing files:", ", ".join(missing))

    port = find_free_port()
    start_server(base_dir, port)


if __name__ == "__main__":
    main()