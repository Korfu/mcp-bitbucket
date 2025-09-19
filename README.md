# Bitbucket MCP

A Model Context Protocol (MCP) server that integrates Cursor IDE with Bitbucket Cloud, allowing you to fetch repository information and commit data directly from your Bitbucket workspace.

## Features

- **List Repositories**: Fetch all repositories from your Bitbucket workspace
- **Repository Details**: Get detailed information about specific repositories
- **Commit Information**: Retrieve commit history and latest commit details
- **Commit Counts**: Get total commit counts per repository
- **Latest Commit Data**: Fetch the most recent commit date, author, and message for each repository
- **Workspaces**: List all available workspaces.
- **Pull Requests**: Create, view, list, and update pull requests.
- **Projects**: View project details and list default reviewers.
- **Branch Restrictions**: Manage branch restrictions for projects and repositories.
- **Commits**: Retrieve individual commits and lists of commits.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Bitbucket Cloud account
- Bitbucket App Password (for authentication)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Create Bitbucket App Password

1. Go to your Bitbucket account settings
2. Navigate to "App passwords" under "Access management"
3. Click "Create app password"
4. Give it a descriptive name (e.g., "Cursor MCP Integration")
5. Select the following permissions:
   - **Repositories**: Read
   - **Account**: Read (optional, for user info)
6. Copy the generated app password

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
BITBUCKET_USERNAME=your_bitbucket_username
BITBUCKET_APP_PASSWORD=your_app_password_from_step_3
BITBUCKET_WORKSPACE=your_workspace_name
```

**Note**: The workspace name is typically your username or organization name. You can find it in your Bitbucket URLs (e.g., `https://bitbucket.org/workspace_name/`).

### 5. Add to Cursor MCP Configuration

Add the following configuration to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["@korfu/bitbucket-mcp"],
      "env": {
        "BITBUCKET_USERNAME": "your_bitbucket_email_address",
        "BITBUCKET_APP_PASSWORD": "your_api_token",
        "BITBUCKET_WORKSPACE": "your_workspace_name"
      }
    }
  }
}
```

### 6. Restart Cursor

After adding the configuration, restart Cursor IDE to load the MCP server.

## Usage

Once configured, you can use the following tools in Cursor:

### Workspaces
- `bitbucket_list_workspaces`

### Repositories
- `bitbucket_list_repositories`
- `bitbucket_get_repository_details`

### Commits
- `bitbucket_list_commits`
- `bitbucket_get_commit`

### Pull Requests
- `bitbucket_list_pull_requests`
- `bitbucket_get_pull_request`
- `bitbucket_create_pull_request`
- `bitbucket_update_pull_request`

### Projects
- `bitbucket_get_project`
- `bitbucket_list_default_reviewers`

### Branch Restrictions
- `bitbucket_list_branch_restrictions`
- `bitbucket_get_branch_restriction`
- `bitbucket_update_repository_branching_model_settings`
- `bitbucket_update_project_branching_model_settings`

## Available Tools

### Workspaces
- **list_workspaces**: Lists all workspaces accessible by the current user.

### Repositories
- **list_repositories**: Lists all repositories in the configured Bitbucket workspace.
- **get_repository_details**: Get detailed information about a specific repository including latest commit info.

### Commits
- **list_commits**: Get commit information for a specific repository.
- **get_commit**: Get a single commit by its hash.

### Pull Requests
- **list_pull_requests**: List all pull requests in a repository.
- **get_pull_request**: Get a single pull request by its ID.
- **create_pull_request**: Create a new pull request.            //Beta version - untested
- **update_pull_request**: Update an existing pull request.      //Beta version - untested

### Projects
- **get_project**: Get a single project by its key.
- **list_default_reviewers**: List default reviewers for a project.

### Branch Restrictions
- **list_branch_restrictions**: List all branch restrictions for a repository.
- **get_branch_restriction**: Get a single branch restriction by its ID.
- **update_repository_branching_model_settings**: Update the branching model configuration for a repository. //Beta version - untested
- **update_project_branching_model_settings**: Update the branching model configuration for a project.       //Beta version - untested

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Project Structure
```
BitbucketMCP/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript output
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Troubleshooting

### Authentication Issues
- Verify your Bitbucket username and app password are correct
- Ensure the app password has the correct permissions (Repositories: Read)
- Check that the workspace name is correct

### Connection Issues
- Verify your internet connection
- Check if Bitbucket API is accessible from your network
- Ensure the MCP server is running (check Cursor's MCP logs)

### Repository Not Found
- Verify the repository name is correct (use the repo slug, not display name)
- Ensure you have access to the repository
- Check that the repository exists in the specified workspace

### MCP Server Not Loading
- Verify the path to `dist/index.js` is correct in your Cursor configuration
- Ensure Node.js is installed and accessible from the command line
- Check Cursor's MCP server logs for error messages

## Security Notes

- Keep your Bitbucket app password secure and never commit it to version control
- Use environment variables or secure configuration management for credentials
- The app password should only have the minimum required permissions
- Consider rotating your app password regularly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
