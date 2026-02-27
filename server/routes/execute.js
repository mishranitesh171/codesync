const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const auth = require('../middleware/auth');

const router = express.Router();

// Strip ANSI escape codes from output
const stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');

// Supported languages config
const LANGUAGE_CONFIG = {
  javascript: {
    extension: '.js',
    command: 'node',
    args: (filePath) => [filePath],
  },
  python: {
    extension: '.py',
    command: 'python',
    args: (filePath) => [filePath],
  },
  typescript: {
    extension: '.ts',
    command: 'npx',
    args: (filePath) => ['ts-node', '--transpile-only', filePath],
  },
};

// @route   POST /api/execute
// @desc    Execute code in a sandboxed child process
// @access  Private
router.post('/', auth, async (req, res) => {
  const { code, language } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ message: 'Code is required.' });
  }

  const langConfig = LANGUAGE_CONFIG[language];
  if (!langConfig) {
    return res.status(400).json({
      message: `Language '${language}' is not supported. Supported: ${Object.keys(LANGUAGE_CONFIG).join(', ')}`,
    });
  }

  // Create a temporary file
  const tmpDir = os.tmpdir();
  const fileName = `collab_exec_${Date.now()}${langConfig.extension}`;
  const filePath = path.join(tmpDir, fileName);

  try {
    // Write code to temp file
    fs.writeFileSync(filePath, code, 'utf-8');

    const result = await new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      const TIMEOUT = 10000; // 10 second timeout

      const child = spawn(langConfig.command, langConfig.args(filePath), {
        timeout: TIMEOUT,
        env: { ...process.env, NODE_ENV: 'sandbox', NO_COLOR: '1', FORCE_COLOR: '0' },
        cwd: tmpDir,
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Limit output size to prevent memory issues
        if (stdout.length > 50000) {
          child.kill();
          stdout = stdout.substring(0, 50000) + '\n... Output truncated (exceeds 50KB limit)';
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (stderr.length > 50000) {
          child.kill();
          stderr = stderr.substring(0, 50000) + '\n... Error output truncated';
        }
      });

      child.on('close', (exitCode) => {
        resolve({
          stdout: stripAnsi(stdout.trim()),
          stderr: stripAnsi(stderr.trim()),
          exitCode,
          timedOut: false,
        });
      });

      child.on('error', (error) => {
        resolve({
          stdout: '',
          stderr: `Execution error: ${error.message}`,
          exitCode: 1,
          timedOut: false,
        });
      });

      // Handle timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          stdout: stdout.trim(),
          stderr: 'Execution timed out (10 second limit).',
          exitCode: 1,
          timedOut: true,
        });
      }, TIMEOUT);
    });

    // Clean up temp file
    try {
      fs.unlinkSync(filePath);
    } catch { }

    res.json({
      output: result.stdout,
      error: result.stderr,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      language,
    });
  } catch (error) {
    // Clean up on error
    try {
      fs.unlinkSync(filePath);
    } catch { }

    console.error('Execute error:', error);
    res.status(500).json({ message: 'Code execution failed.', error: error.message });
  }
});

module.exports = router;
