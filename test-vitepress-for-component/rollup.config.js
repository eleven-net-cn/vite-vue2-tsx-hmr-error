import path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [{
  input: 'src/index.js',
  output: 'lib/index.js'
}].map(options => {
  const input = path.resolve(options.input)
  const output = path.resolve(options.output)
  delete options.input
  delete options.output

  return Object.assign({}, {
    input: path.resolve(input),
    output: {
      file: path.resolve(output),
      format: 'cjs',
      exports: 'named'
    },
    plugins: [].concat(
      resolve({
        preferBuiltins: true
      }),
      babel({ exclude: 'node_modules/**' }),
      json({ exclude: 'node_modules/**' }),
      commonjs()
    ),
    external: [].concat(
      Object.keys(Object.assign(
        {},
        pkg.dependencies,
        pkg.optionalDependencies,
        pkg.peerDependencies
      ))
    )
  }, options)
})
