# AlgoFlowX — Interactive Algorithm Visualizer

AlgoFlowX is a modern, step-by-step visualizer for classic algorithms across Sorting, Searching, Graphs, Dynamic Programming, Greedy, and Recursion. It focuses on an intuitive, consistent UX with custom inputs, examples, random generators, validation, reset, helpful tips, and animated playback with adjustable speed.

**Stack:** React 18, Vite 6, Tailwind CSS, lucide-react icons, shadcn/ui utilities.

## Features
- **Consistent Controls:** Play/Pause, Step, Reset, Speed control with smooth animations.
- **Custom Inputs:** Enter your own arrays/strings/numbers, with inline validation and performance caps where needed.
- **Examples & Randomizers:** One-click presets and random generators to explore behavior quickly.
- **Helpful Tips:** Inline guidance for formats, limits, and interpretation of visual states.
- **Responsive UI:** Clean, accessible visuals that scale from small to large screens.

## Visualizers (Routes)
- **Searching:** `Linear Search` (`/linear-search`), `Binary Search` (`/binary-search`).
- **Sorting:** `Bubble`, `Selection`, `Insertion`, `Merge`, `Quick`, `Heap`, `Counting`, `Bucket`, `Topological` (DAG) — e.g. `/quick-sort`.
- **Graphs:** `BFS`, `DFS`, `Dijkstra`, `Bellman-Ford`, `Floyd–Warshall`, `Kruskal`, `Prim`, `Union-Find (DSU)`, `N-Queen` — e.g. `/dijkstras`.
- **Dynamic Programming:** `Knapsack` (`/knapsack`), `Dynamic` hub (`/dynamic`) for Fibonacci, Coin Change, and LCS with inputs/examples/random/reset/tips.
- **Greedy:** `Huffman Coding` (`/huffman-coding`), overview (`/greedy`).
- **Recursion:** `Sudoku Solver` (`/sudoku-solver`), `KMP Pattern Matcher` (`/kmp-pattern-matcher`).

## Recent Highlights
- **Unified UX Pattern:** Pages now share a consistent pattern: custom inputs, presets, random generation, validation, reset, tips, and auto-run on Play/Step if steps aren’t generated yet.
- **Dynamic Programming Hub:** Inputs and validation for Fibonacci (N cap), Coin Change (coins + amount cap), and LCS (string length caps); presets, randomization, reset, tips, and auto-run.
- **Backtracking Enhancements:** Backtracking visual experiences aligned with the same pattern across related pages.
- **Sudoku Solver — Variable Size:** Choose the subgrid base `b` (2–4). Board size is `N = b²` (e.g., 2→4×4, 3→9×9, 4→16×16). Preset examples appear for 9×9; random puzzle generation respects total cell count; parsing/validation and subgrid borders adapt to `b`.

## Getting Started
Prerequisites: Node.js 18+ recommended.

Install dependencies and run the dev server:

```powershell
cd AlgoFlowX
npm install
npm run dev
```

Other scripts:

```powershell
# Production build
npm run build

# Preview the production build
npm run preview

# Lint the codebase
npm run lint
```

Open the app at the URL printed by Vite (usually http://localhost:5173). Use the top-level navigation or direct routes (see above) to explore visualizers.

## Usage Notes
- **Custom Inputs:** Most pages accept user input. Invalid input shows a clear error banner; caps prevent excessively large visualizations.
- **Examples & Random:** Use example buttons to load common cases or generate random inputs/puzzles that match the page rules.
- **Auto-Run:** Hitting Play/Step when no steps are present triggers step generation with current inputs.
- **Sudoku Format:** Provide `N` lines (where `N = b²`), space-separated integers `0..N` (or `.` for empty). Random generation uses a filled valid grid and removes cells until the clue target.

## Project Structure
- `src/AlgorithmPages/Searching`: Linear, Binary
- `src/AlgorithmPages/Sorting`: Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Bucket, Topological
- `src/AlgorithmPages/Graph`: BFS, DFS, Dijkstra, Bellman-Ford, Floyd–Warshall, Kruskal, Prim, Union-Find (DSU), N-Queen
- `src/AlgorithmPages/DP`: Knapsack, Dynamic hub (Fibonacci / Coin Change / LCS), BackTrack
- `src/AlgorithmPages/Greedy`: Huffman, Greedy overview
- `src/AlgorithmPages/Recursion`: Sudoku Solver, KMP Pattern Matcher, Recursion hub
- `src/components`: Layout, shared UI
- `src/styles`, `index.css`, `App.css`: Global styles

## Adding a New Visualizer
- Place a new component under the closest matching folder in `src/AlgorithmPages/*`.
- Follow the shared UX: inputs (with validation), example presets, random generation, reset, tips, and auto-run on Play/Step.
- Wire it in `src/App.jsx` by adding a route and, if applicable, link from the main layout.

## Contributing
Contributions are welcome! Feel free to:
- Improve algorithms, correctness checks, and explanations.
- Add more examples/presets and random generators.
- Enhance UI/UX consistency and accessibility.

Open a PR with a concise description, screenshots (if UI changes), and a quick test plan.

## License
This project is available under an open-source license. If a specific license file is added later, it will govern usage and contributions.

---
Questions or ideas? Open an issue or start a discussion — happy to iterate!

