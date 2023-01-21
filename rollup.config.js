import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const config = {
    input: './lib/pgn-writer.js',
    output: {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'PgnWriter',
    },
    plugins: [commonjs(), resolve()],
}

export default config