import { minimatch } from 'minimatch';

export type GitHubTreeItem = {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
};

export type ProcessedTreeItem = GitHubTreeItem & {
  files?: ProcessedTree;
};

export type ProcessedTree = {
  [key: string]: ProcessedTreeItem;
};

// GitHub API functions
async function githubRequest(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  return response.json();
}

async function getRepoTree(owner: string, repo: string) {
  try {
    const branchData = await githubRequest(`/repos/${owner}/${repo}/branches/main`);
    const treeSha = (branchData as any).commit.commit.tree.sha;
    const treeData = await githubRequest(`/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
    return (treeData as any).tree;
  } catch (error) {
    console.error('Error fetching repo tree:', error);
    throw error;
  }
}

// Main function to process directory
export async function processDir(
  url: string,
  excludedPaths: string[] = [],
  excludedGlobs: string[] = []
): Promise<ProcessedTree> {
  const foldersToIgnore = ['.git', ...excludedPaths];

  // Parse the URL to get the owner and repo
  const urlParts = url.split('/');
  const owner = urlParts[3];
  const repo = urlParts[4];

  if (!owner || !repo) {
    throw new Error('Invalid GitHub URL');
  }

  // Get the repository tree from GitHub
  const tree = await getRepoTree(owner, repo);

  // Check if the path should be excluded
  const shouldExcludePath = (path: string) => {
    return (
      foldersToIgnore.some((folder) => path.startsWith(folder)) ||
      excludedGlobs.some((glob) => minimatch(path, glob))
    );
  };

  // Process the tree to build the directory structure
  const processTree = (tree: GitHubTreeItem[]): ProcessedTree => {
    const result: ProcessedTree = {};
    tree.forEach((item: GitHubTreeItem) => {
      if (shouldExcludePath(item.path)) return;

      const parts = item.path.split('/');
      let current: ProcessedTree = result;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part && !(part in current)) {
          current[part] = i === parts.length - 1 
            ? { ...item, files: undefined } 
            : { path: part, mode: '', type: 'tree', sha: '', url: '', files: {} };
        }
        if (part && i < parts.length - 1) {
          (current[part] as ProcessedTreeItem).files ??= {};
          current = (current[part] as ProcessedTreeItem).files!;
        }
      }
    });
    return result;
  };

  return processTree(tree);
}