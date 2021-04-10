export function* createReg(
  reg: string | RegExp,
  content: string,
): Generator<RegExpExecArray, void, unknown> {
  if (typeof content !== 'string') {
    throw TypeError('expected content to be string');
  }

  let newReg: RegExp;
  if (reg instanceof RegExp) {
    // if passed in a RegExp, make a copy, and add 'global' if it doesn't already

    const flags = reg.flags;
    newReg = new RegExp(reg, flags.includes('g') ? flags : flags + 'g');
    // Match lastIndex, since they went to the trouble of passing in a non-zero index, it must
    // be for a reason, right?
    newReg.lastIndex = reg.lastIndex;
  } else if (typeof reg === 'string') {
    // make a RegExp from the string

    newReg = new RegExp(reg, 'g');
  } else {
    throw TypeError('expected reg to be string or RegExp');
  }

  // yield until empty
  let match = newReg.exec(content);
  while (match !== null) {
    yield match;
    match = newReg.exec(content);
  }
}
