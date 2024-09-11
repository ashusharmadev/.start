const vscode = require('vscode');
const fs = require("fs");
const path = require("path");

function executeCommands(commands) {
  for (const commandGroup of commands) {
    const terminal = vscode.window.createTerminal();
    for (const command of commandGroup) {
      terminal.sendText(command);
    }
    terminal.show();
  }
}


function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Tab</title>
  <style>
    body {
      display: flex;
      height: 100vh;
      margin: 0;
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
    }
    #sidebar {
      width: 200px;
      background: var(--vscode-sideBar-background);
      color: var(--vscode-sideBar-foreground);
      padding: 10px;
    }
    #content {
      flex: 1;
      padding: 10px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    h1, h3 {
      color: var(--vscode-editor-foreground);
    }
    ul {
      padding: 0;
      list-style: none;
    }
    li {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div id="sidebar">
    <h3>Sidebar</h3>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>
  <div id="content">
    <h1>Content Area</h1>
    <p>Here is the main content area.</p>
  </div>
  <script>
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'updateTheme') {
        document.body.style.setProperty('--vscode-editor-foreground', message.theme.editorForeground);
        document.body.style.setProperty('--vscode-editor-background', message.theme.editorBackground);
        document.body.style.setProperty('--vscode-sideBar-background', message.theme.sideBarBackground);
        document.body.style.setProperty('--vscode-sideBar-foreground', message.theme.sideBarForeground);
      }
    });
  </script>
</body>
</html>`;
}


function parseStartFile(startFilePath) {
  fs.readFile(startFilePath, "utf8", (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(
        "Can't locate provided .start file."
      );
      return;
    }

    const commands = data
      .split("\n")
      .filter((line) => line.startsWith("\\t"))
      .map((line) =>
        line
          .slice(3)
          .split(",")
          .map((cmd) => cmd.trim())
      );

    executeCommands(commands);
  });
}

function getWorkspaceRoot() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }
  return null;
}

function searchStartFiles(rootFolder) {
  vscode.workspace.findFiles('**/.start*', '**/node_modules/**', 10).then(files => {
    if (files.length > 0) {
      const commandItems = files.map(file => {
        const fileName = path.basename(file.fsPath);
        const commandSuffix = fileName.substring('.start'.length); // Extract string after .start
        const commandId = `extension.openStart${commandSuffix}`;

        return {
          label: `Open ${(commandSuffix || "").trim().length > 0 ? commandSuffix.trim() : fileName}`,
          description: `Open ${fileName}`,
          commandId: commandId,
          filePath: file.fsPath
        };
      });

      if (commandItems.length === 1) {
        parseStartFile(commandItems[0].filePath);
      }
      else {
        vscode.window.showQuickPick(commandItems, {
          placeHolder: 'Select a .start file to open'
        }).then(selected => {
          if (selected) {
            parseStartFile(selected.filePath);
          }
        });
      }
    } else {
      vscode.window.showInformationMessage("No files starting with .start found in the workspace.");
    }
  });
}

function activate(context) {

  let disposable = vscode.commands.registerCommand(
    "start.bootProject",
    function () {
      const workspaceRoot = getWorkspaceRoot();
      if (workspaceRoot) {
        searchStartFiles(workspaceRoot);
      }
      else {
        vscode.window.showInformationMessage("No workspace found.");
      }
    }
  );

  context.subscriptions.push(disposable);

  // context.subscriptions.push(
  //   vscode.commands.registerCommand('start.openMainView', () => {
  //     const panel = vscode.window.createWebviewPanel(
  //       'myCustomTab', // Identifies the type of the webview. Used internally
  //       'My Custom Tab', // Title of the panel displayed to the user
  //       vscode.ViewColumn.One, // Editor column to show the new webview panel in
  //       {
  //         enableScripts: true // Enable scripts in the webview
  //       }
  //     );

  //     panel.webview.html = getWebviewContent();

  //     // Send the initial theme data
  //     const config = vscode.workspace.getConfiguration('workbench');
  //     const colorCustomizations = config.get('colorCustomizations');
  //     const theme = {
  //       editorForeground: colorCustomizations?.['editor.foreground'] || '',
  //       editorBackground: colorCustomizations?.['editor.background'] || '',
  //       sideBarBackground: colorCustomizations?.['sideBar.background'] || '',
  //       sideBarForeground: colorCustomizations?.['sideBar.foreground'] || ''
  //     };

  //     panel.webview.postMessage({ type: 'updateTheme', theme });

  //     // Update the webview when the theme changes
  //     vscode.window.onDidChangeActiveColorTheme(() => {
  //       const newTheme = {
  //         editorForeground: colorCustomizations?.['editor.foreground'] || '',
  //         editorBackground: colorCustomizations?.['editor.background'] || '',
  //         sideBarBackground: colorCustomizations?.['sideBar.background'] || '',
  //         sideBarForeground: colorCustomizations?.['sideBar.foreground'] || ''
  //       };
  //       panel.webview.postMessage({ type: 'updateTheme', theme: newTheme });
  //     });
  //   })
  // );
}


function deactivate() { }

module.exports = {
  activate,
  deactivate
};