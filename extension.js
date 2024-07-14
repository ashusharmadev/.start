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
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};