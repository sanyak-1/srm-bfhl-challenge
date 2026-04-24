const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/bfhl', (req, res) => {
    try {
        const data = req.body.data;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid input format." });
        }

        const invalid_entries = [];
        const duplicate_edges = [];
        const valid_edges = [];
        const seen_edges = new Set();

        // 1. VALIDATION & DUPLICATES
        data.forEach(item => {
            if (typeof item !== 'string') {
                invalid_entries.push(String(item));
                return;
            }
            const trimmedItem = item.trim();
            const isValidFormat = /^[A-Z]->[A-Z]$/.test(trimmedItem);
            
            if (!isValidFormat || trimmedItem.split('->')[0] === trimmedItem.split('->')[1]) {
                invalid_entries.push(trimmedItem);
                return;
            }

            if (seen_edges.has(trimmedItem)) {
                duplicate_edges.push(trimmedItem);
            } else {
                seen_edges.add(trimmedItem);
                valid_edges.push(trimmedItem);
            }
        });

        // 2. TREE GRAPH SETUP
        const adj = {};
        const parents = {};
        const allNodes = new Set();

        valid_edges.forEach(edge => {
            const [u, v] = edge.split('->');
            allNodes.add(u);
            allNodes.add(v);
            
            // Multi-parent rule: if a node has more than one parent, the first encountered wins
            if (parents[v]) return; // silently discard subsequent parent edges
            parents[v] = u;
            
            if (!adj[u]) adj[u] = [];
            adj[u].push(v);
        });

        const visited = new Set();
        const hierarchies = [];
        let total_trees = 0;
        let total_cycles = 0;
        let largest_tree_root = "";
        let max_depth = 0;

        // Recursive helper to build trees and calculate depth
        function buildTree(node) {
            visited.add(node);
            const treeObj = {};
            let currentDepth = 1;
            
            if (adj[node]) {
                let maxChildDepth = 0;
                adj[node].sort().forEach(child => {
                    const { tree, depth } = buildTree(child);
                    treeObj[child] = tree;
                    maxChildDepth = Math.max(maxChildDepth, depth);
                });
                currentDepth += maxChildDepth;
            }
            return { tree: treeObj, depth: currentDepth };
        }

        // 3. PROCESS VALID TREES (Nodes that never appear as children)
        const roots = Array.from(allNodes).filter(node => !parents[node]).sort();
        
        roots.forEach(root => {
            const { tree, depth } = buildTree(root);
            hierarchies.push({ root, tree, depth });
            total_trees++; // Counts only valid, non-cyclic trees
            
            // Tiebreaker logic for largest tree root
            if (depth > max_depth) {
                max_depth = depth;
                largest_tree_root = root;
            } else if (depth === max_depth && max_depth > 0) {
                if (root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        });

        // 4. PROCESS PURE CYCLES
        const unvisited = Array.from(allNodes).filter(node => !visited.has(node));
        while (unvisited.length > 0) {
            let curr = unvisited.shift();
            if (visited.has(curr)) continue;
            
            const cycleNodes = [];
            while (!visited.has(curr)) {
                visited.add(curr);
                cycleNodes.push(curr);
                curr = adj[curr] ? adj[curr][0] : null; 
                if (!curr) break; 
            }
            
            if (cycleNodes.length > 0) {
                // If pure cycle, use lexicographically smallest node as root
                cycleNodes.sort();
                const cycleRoot = cycleNodes[0];
                
                hierarchies.push({
                    root: cycleRoot,
                    tree: {}, // empty {} if cycle
                    has_cycle: true
                });
                total_cycles++;
            }
        }

        // 5. FINAL RESPONSE FORMAT
        const response = {
            user_id: "sanyakulshrestha_05112003", // Format: fullname_ddmmyyyy 
            email_id: "sk9247@srmist.edu.in", // [cite: 35]
            college_roll_number: "RA2311003011420", // [cite: 35]
            hierarchies: hierarchies,
            invalid_entries: invalid_entries,
            duplicate_edges: duplicate_edges,
            summary: {
                total_trees: total_trees,
                total_cycles: total_cycles,
                largest_tree_root: largest_tree_root
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});