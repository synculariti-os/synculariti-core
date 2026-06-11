// collect-todos.ts – gathers all TODO comments into a JSON file for CI reporting
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import * as path from "path";

// Run ripgrep (rg) to find TODO comments with line numbers
// We search the repo root, ignoring node_modules and .git
const result = execSync(`git grep -n "TODO"`, { encoding: "utf-8" });

interface TodoEntry {
  file: string;
  line: number;
  text: string;
}

const todos: TodoEntry[] = [];
for (const line of result.split("\n")) {
  if (!line.trim()) continue;
  // rg output: path:line_number:matched_text
  const [filePath, lineNum, ...rest] = line.split(":");
  const txt = rest.join(":").trim();
  todos.push({
    file: path.relative(process.cwd(), filePath),
    line: Number(lineNum),
    text: txt,
  });
}

// Write JSON artifact
const outPath = path.resolve(process.cwd(), "todos.json");
writeFileSync(outPath, JSON.stringify(todos, null, 2));
console.log(`Collected ${todos.length} TODOs → ${outPath}`);
