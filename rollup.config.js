import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/RMCP.js',
    format: 'iife',
	name:'RMCP'
  },
  plugins: [
    svelte({})
  ]
}