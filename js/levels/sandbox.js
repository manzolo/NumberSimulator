// Free mode: any command, literal inputs, no verification. A starter that
// shows off the floating-point view.

export const SANDBOX = {
  script: `# Free sandbox — try any command with literal numbers.
#   to bin 42 · to hex 255 · from hex 2a
#   bits 42 --width 8 · add 200 100 --width 8 · neg 5 --width 8
#   fixed 3.25 --int 4 --frac 4 · utf8 "è"
ieee 3.14 --bits 32`,
  vars: {},
};
