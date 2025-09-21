module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: './CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false, // Set to true if you want to publish to npm registry
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['./CHANGELOG.md', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['./CHANGELOG.md'],
      },
    ],
  ],
};
