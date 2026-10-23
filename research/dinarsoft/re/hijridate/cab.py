"""Extract a DinarSoft CAB into a fresh temp folder with 7z and return the path of the file whose CAB name starts with prefix.
The installer is read as data only; nothing from it is ever run natively."""
import os, subprocess, tempfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
def extract(cab, member):
    out = tempfile.mkdtemp(prefix='dscab-')
    subprocess.run(['7z', 'x', '-y', '-o' + out, os.path.join(ROOT, 'downloads', cab)], check=True, capture_output=True)
    return os.path.join(out, member)
