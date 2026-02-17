import os
import subprocess
import tempfile
import time
import shutil


def test_osiris_interceptor_creates_ncct():
    script = '/home/devinpd/bin/osiris_interceptor.sh'
    assert os.path.exists(script), 'interceptor script missing: ' + script
    tmpdir = tempfile.mkdtemp(prefix='osiris_test_')
    env = os.environ.copy()
    env['OSIRIS_NCCT_DIR'] = tmpdir
    env['OSIRIS_LOG'] = os.path.join(tmpdir, 'log.txt')
    # Run script with safe arg (won't invoke external copilot/claude)
    subprocess.check_call([script, 'test', 'DNA-Lang quantum circuit'], env=env)
    # Allow a short grace period for file writes
    time.sleep(0.1)
    files = os.listdir(tmpdir)
    ncct_files = [f for f in files if f.startswith('ncct_') and (f.endswith('.py') or f.endswith('.py.gpg'))]
    assert ncct_files, f'No ncct files created in {tmpdir}; files: {files}'
    # If plaintext file present, check contents
    for fn in ncct_files:
        if fn.endswith('.py'):
            with open(os.path.join(tmpdir, fn), 'r', encoding='utf-8') as fh:
                content = fh.read()
            assert 'ΛΦ=2.176e-8' in content
            assert 'Prompt: DNA-Lang quantum circuit' in content
            break
    shutil.rmtree(tmpdir)


if __name__ == '__main__':
    test_osiris_interceptor_creates_ncct()
    print('smoke test passed')
