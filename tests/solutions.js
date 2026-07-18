// The reference solutions, one per level, keyed by level id. Each level file
// exports its own `solution`; this module is the single map used by the tests
// and the e2e driver.

import { solution as bitWeights } from '../js/levels/level01.js';
import { solution as decToBin } from '../js/levels/level02.js';
import { solution as hexNibbles } from '../js/levels/level03.js';
import { solution as readBase } from '../js/levels/level04.js';
import { solution as binaryAdd } from '../js/levels/level05.js';
import { solution as overflow } from '../js/levels/level06.js';
import { solution as binarySub } from '../js/levels/level07.js';
import { solution as twosComplement } from '../js/levels/level08.js';
import { solution as signedAdd } from '../js/levels/level09.js';
import { solution as shiftMask } from '../js/levels/level10.js';
import { solution as fixedPoint } from '../js/levels/level11.js';
import { solution as ieee32 } from '../js/levels/level12.js';
import { solution as charEncoding } from '../js/levels/level13.js';
import { solution as doubleCapstone } from '../js/levels/level14.js';

export const SOLUTIONS = {
  'bit-weights': bitWeights,
  'dec-to-bin': decToBin,
  'hex-nibbles': hexNibbles,
  'read-base': readBase,
  'binary-add': binaryAdd,
  overflow,
  'binary-sub': binarySub,
  'twos-complement': twosComplement,
  'signed-add': signedAdd,
  'shift-mask': shiftMask,
  'fixed-point': fixedPoint,
  ieee32,
  'char-encoding': charEncoding,
  'double-capstone': doubleCapstone,
};
