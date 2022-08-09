/**
 * @jest
 */

test('should not be undefined', () => {
  const main = require('../src').default
  expect(main).not.toBe(undefined)
})
