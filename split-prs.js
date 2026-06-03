const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd, allowFail = false) {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    if (!allowFail) {
      console.error(`FAILED: ${cmd}`);
      console.error(e.stderr);
      console.error(e.stdout);
      process.exit(1);
    }
    return e.stdout;
  }
}

// Ensure we're on master
run('git checkout master', true);

// 1. Get all commits
const commits = run('git log master --reverse --format="%H"').trim().split('\n').filter(Boolean);
console.log(`Found ${commits.length} commits.`);

// Save README.md
const readmeContent = fs.readFileSync('README.md', 'utf8');

// 2. Create main branch
run('git checkout --orphan main');
run('git rm -rf .', true);

// Write back README
fs.writeFileSync('README.md', readmeContent);
run('git add README.md');
run('git commit -m "Initialize repository with README.md"');

// 3. Create 10 branches
const numBranches = 10;
const commitsPerBranch = Math.ceil(commits.length / numBranches);

let currentBase = 'main';

for (let i = 0; i < numBranches; i++) {
  const branchName = `feature/pr-${i + 1}`;
  run(`git checkout -b ${branchName} ${currentBase}`);
  
  const startIdx = i * commitsPerBranch;
  const endIdx = Math.min((i + 1) * commitsPerBranch, commits.length);
  
  for (let j = startIdx; j < endIdx; j++) {
    const commit = commits[j];
    console.log(`Cherry-picking ${commit}`);
    try {
      execSync(`git cherry-pick -X theirs ${commit}`, { stdio: 'pipe' });
    } catch (e) {
      console.log(`Conflict during cherry-pick ${commit}. Resolving...`);
      run('git add .', true);
      run('git cherry-pick --continue', true);
    }
  }
  
  currentBase = branchName;
}

console.log('Successfully created 10 PR branches!');
