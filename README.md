# Bitbucket MCP

A Model Context Protocol (MCP) server that integrates Cursor IDE with Bitbucket Cloud, allowing you to fetch repository information and commit data directly from your Bitbucket workspace.

## Features

- **List Repositories**: Fetch all repositories from your Bitbucket workspace
- **Repository Details**: Get detailed information about specific repositories
- **Commit Information**: Retrieve commit history and latest commit details
- **Commit Counts**: Get total commit counts per repository
- **Latest Commit Data**: Fetch the most recent commit date, author, and message for each repository

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

**For macOS/Linux:**
```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": ["/path/to/BitbucketMCP/dist/index.js"],
      "env": {
        "BITBUCKET_USERNAME": "your_bitbucket_username",
        "BITBUCKET_APP_PASSWORD": "your_app_password",
        "BITBUCKET_WORKSPACE": "your_workspace_name"
      }
    }
  }
}
```

**For Windows:**
```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node.exe",
      "args": ["C:\\path\\to\\BitbucketMCP\\dist\\index.js"],
      "env": {
        "BITBUCKET_USERNAME": "your_bitbucket_username",
        "BITBUCKET_APP_PASSWORD": "your_app_password",
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

### 1. List Repositories
```
List all repositories in my Bitbucket workspace
```
or
```
List repositories with commit information
```

### 2. Get Repository Details
```
Get details for repository "my-repo-name"
```

### 3. Get Repository Commits
```
Show recent commits for repository "my-repo-name"
```

## Available Tools

### `list_repositories`
Lists all repositories in your Bitbucket workspace.

**Parameters:**
- `include_commit_info` (boolean, optional): Include commit count and latest commit info
- `limit` (number, optional): Maximum repositories to return (default: 50, max: 100)

### `get_repository_commits`
Gets commit history for a specific repository.

**Parameters:**
- `repository_name` (string, required): Name of the repository
- `limit` (number, optional): Maximum commits to return (default: 50, max: 100)

### `get_repository_details`
Gets detailed information about a specific repository including latest commit data.

**Parameters:**
- `repository_name` (string, required): Name of the repository

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