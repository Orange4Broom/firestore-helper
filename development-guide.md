# Development and Publishing Guide

## 1. Publishing a New Package Version

When you're ready to release a new version of your package, follow these steps:

### A) Update the Version in package.json

You can either manually edit the version in the `package.json` file, or (recommended) use the npm command that will do it for you and create a commit at the same time:

```bash
# To increase patch version (1.2.0 -> 1.2.1)
npm version patch

# To increase minor version (1.2.0 -> 1.3.0)
npm version minor

# To increase major version (1.2.0 -> 2.0.0)
npm version major
```

This not only updates the version number in `package.json`, but also automatically creates a git commit and tag with this version.

> **Tip:** Versions follow semantic versioning (SemVer) rules:
>
> - **patch** - for bug fixes and small changes that don't affect the API
> - **minor** - for new features that are backward compatible
> - **major** - for changes that modify the API and are not backward compatible

### B) Creating and Pushing a Tag

If you used `npm version`, the tag was already created automatically. You just need to push it to GitHub:

```bash
# Push code changes
git push origin master

# Push tags (important!)
git push origin --tags
```

Alternatively, if you want to manually create a tag:

```bash
# Create a tag (must start with "v" + version number)
git tag v1.2.3

# Push the tag to GitHub
git push origin v1.2.3
```

### C) Monitoring the Publishing Process

After pushing the tag, GitHub Actions will automatically:

1. Run the workflow defined in `.github/workflows/publish.yml`
2. Check and test the code
3. Build the distribution version of the package
4. Publish the package to npm
5. Create a GitHub Release with notes

You can monitor the publishing process at:

- The "Actions" tab in your GitHub repository: https://github.com/Orange4Broom/firestore-helper/actions
- In the "Releases" section after completion: https://github.com/Orange4Broom/firestore-helper/releases

After successful completion, the new version of the package will be available on the npm registry.

## 2. Continuous Development with Branches and Pull Requests

For systematic development of new features or bug fixes, it's advisable to use isolated branches:

### A) Creating a New Branch for Feature Development

```bash
# Make sure you have the latest master
git checkout master
git pull origin master

# Create a new branch with a descriptive name
git checkout -b feature/new-module
# or
git checkout -b fix/api-bug-fix
```

Conventions for branch names:

- `feature/feature-name` - for new features
- `fix/fix-name` - for bug fixes
- `refactor/description` - for code refactoring

### B) Development and Committing Changes

Work on the functionality in your branch and make commits:

```bash
# Add changed files
git add .

# Commit with a descriptive comment
git commit -m "Add: Implementation of new module for transaction handling"
```

Tips for commit messages:

- Use prefixes like "Add:", "Fix:", "Update:", "Refactor:" for clarity
- Write in present tense, e.g., "Add" instead of "Added"
- Keep messages concise, but informative

### C) Pushing the Branch and Creating a Pull Request

```bash
# Push your branch to GitHub
git push origin feature/new-module
```

Then go to GitHub and create a Pull Request:

1. Go to your repository
2. Click on "Pull requests" > "New pull request"
3. Select `master` as the target branch and your branch `feature/new-module` as the source
4. Write a description of the changes in the PR
5. Click on "Create pull request"

### D) Automated Testing in the Pull Request

After creating a pull request, the CI workflow will automatically run:

1. GitHub Actions will check your code
2. Run tests on different Node.js versions
3. Check if the build passes

You'll see the test results directly in the pull request - either a green checkmark (passed) or a red X (failed).

### E) Review, Adjustments, and Merge

1. If tests fail, fix the issues in your branch and push again
2. After successful testing, the PR can be reviewed by other developers
3. After approval, you can merge the PR into master using the "Merge pull request" button
4. Then you can delete your branch

## 3. Working with Dependabot

Dependabot automatically checks your project's dependencies and creates pull requests with updates:

### A) How Dependabot Works

1. Every week (according to the configuration in `.github/dependabot.yml`) it checks all dependencies
2. If it finds outdated packages, it creates a pull request with an update
3. For minor and patch updates, it will be automatically approved and merged (according to the workflow in `.github/workflows/dependabot-auto-merge.yml`)
4. For major updates, manual review and merge are required

### B) Working with Dependabot Pull Requests

For major updates or pull requests that didn't merge automatically:

1. Check the changes in the PR
2. Run tests locally if you need additional verification
3. If everything looks good, approve and merge the PR
4. If the update causes problems, you can close the PR and ignore the update, or manually adjust the version in `package.json`
