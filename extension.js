const vscode = require('vscode');
const fs = require("fs");
const path = require("path");

function getBasePath(filePath) {
  let basePath = './';
  let paths = filePath.split("/");
  paths.splice(paths.length - 1, 1);
  basePath = paths.join("/");
  let name = null;
  if(paths.length > 0) {
    name = paths[paths.length-1];
  }
  return {
    basePath: basePath,
    terminalName: name
  };
}


function executeCommands(filePath, commands) {
  const {basePath, terminalName} = getBasePath(filePath);
  for (const commandGroup of commands) {
    let params = {}
    if(terminalName && terminalName.length > 0) {
      params = {
        name: terminalName
      }
    }
    const terminal = vscode.window.createTerminal(params);
    terminal.sendText(`cd ${basePath}`);
    for (const command of commandGroup) {
      terminal.sendText(command);
    }
    terminal.show();
  }
}


function parseStartFile(startFilePath) {
  fs.readFile(startFilePath, 'utf8', (err, data) => {
    if (err) {
      vscode.window.showErrorMessage("Can't locate provided .start file.");
      return;
    }

    const commands = data
      .split('\n')
      .filter((line) => line.startsWith('\\t'))
      .map((line) =>
        line
          .slice(3)
          .split(',')
          .map((cmd) => cmd.trim())
      );

    const filteredCommands = commands.filter(commandGroup =>
      commandGroup.every(cmd => !cmd.startsWith('\\c') && !cmd.startsWith('\\d'))
    );

    executeCommands(startFilePath, filteredCommands);
  });
}


function getWorkspaceRoot() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }
  return null;
}

function searchStartFiles(rootFolder, autoRun) {
  vscode.workspace.findFiles('**/.start*', '**/node_modules/**', 10).then(files => {
    if (files.length > 0) {

      let was_default_found = false;
      let default_start = {};

      const commandItems = files.map(file => {
        const fileName = path.basename(file.fsPath);
        const commandSuffix = fileName.substring('.start'.length); // Extract string after .start
        const commandId = `extension.openStart${commandSuffix}`;
        let isDefault = false;
        try {
          const firstLine = fs.readFileSync(file.fsPath, 'utf-8').split('\n')[0];
          if (firstLine.includes('\\d')) {
            isDefault = true;
          }
        } catch (error) {
          console.error(`Error reading file ${file.fsPath}: ${error}`);
        }

        if (isDefault && !was_default_found) {
          was_default_found = true;
          default_start = {
            label: `Open ${(commandSuffix || "").trim().length > 0 ? commandSuffix.trim() : fileName}`,
            description: `Open ${fileName}`,
            commandId: commandId,
            filePath: file.fsPath,
            isDefault: isDefault
          }
        }

        return {
          label: `Open ${(commandSuffix || "").trim().length > 0 ? commandSuffix.trim() : fileName}`,
          description: `${file.fsPath}`,
          commandId: commandId,
          filePath: file.fsPath,
          isDefault: isDefault
        };
      });

      if (commandItems.length === 1) {
        parseStartFile(commandItems[0].filePath);
      }
      else {
        if (was_default_found && autoRun && default_start) {
          parseStartFile(default_start.filePath);
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
        searchStartFiles(workspaceRoot, false);
      }
      else {
        vscode.window.showInformationMessage("No workspace found.");
      }
    }
  );

  let workspace_root = getWorkspaceRoot();
  if (workspace_root) {
    searchStartFiles(workspace_root, true);
  }
  else {
    vscode.window.showInformationMessage("No workspace found.");
  }

  context.subscriptions.push(disposable);

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