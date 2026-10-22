import fs from 'node:fs';

const requiredFiles = [
  'third_party/NOTICE.md',
  'docs/14_OPEN_SOURCE_REUSE_POLICY.md',
];

const requiredNoticeHeadings = [
  '### Repository',
  '### Upstream URL',
  '### License',
  '### Commit SHA',
  '### Files copied',
  '### Files adapted',
  '### Usage in 123Charts',
  '### Review owner',
  '### Date added',
  '### Risk notes',
];

const knownUpstreamRepos = [
  'gijsverheijke/directorystarter',
  'Durgesh-Vaigandla/AI-tools-database',
  'AlbertYang666/ainav',
  'DiscovAI/DiscovAI-search',
  'lakey009/AI-Tools-List',
  'mahseema/awesome-ai-tools',
  'ToolkitlyAI/awesome-ai-tools',
  'aitoollist/awesome-ai-tool-list',
  'nolly-studio/cult-directory-template',
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing required file: ${file}`);
  }
}

if (fs.existsSync('third_party/NOTICE.md')) {
  const notice = fs.readFileSync('third_party/NOTICE.md', 'utf8');
  for (const heading of requiredNoticeHeadings) {
    if (!notice.includes(heading)) {
      errors.push(`NOTICE is missing required heading: ${heading}`);
    }
  }
}

if (fs.existsSync('docs/15_OPEN_SOURCE_REUSE_PLAN.md') && fs.existsSync('third_party/NOTICE.md')) {
  const plan = fs.readFileSync('docs/15_OPEN_SOURCE_REUSE_PLAN.md', 'utf8');
  const notice = fs.readFileSync('third_party/NOTICE.md', 'utf8');

  for (const repo of knownUpstreamRepos) {
    if (plan.includes(repo)) {
      const repoIndex = notice.indexOf(repo);
      if (repoIndex === -1) {
        errors.push(`NOTICE must include an entry for upstream repo mentioned in plan: ${repo}`);
        continue;
      }

      const entryStart = notice.lastIndexOf('### Repository', repoIndex);
      const nextEntry = notice.indexOf('### Repository', repoIndex + repo.length);
      const entry = notice.slice(entryStart === -1 ? repoIndex : entryStart, nextEntry === -1 ? notice.length : nextEntry);

      if (!/### License\s+[\s\S]*?\S/.test(entry)) {
        errors.push(`NOTICE entry for ${repo} must include a license field`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('third-party:check failed');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('third-party:check passed');
