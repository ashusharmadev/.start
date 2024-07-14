// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const START_FILE_NAME = ".start";

function executeCommands(commands) {
  for (const commandGroup of commands) {
    const terminal = vscode.window.createTerminal();
    for (const command of commandGroup) {
      terminal.sendText(command);
    }
    terminal.show();
  }
}

function parseStartFile(rootFolder) {
  const startFilePath = path.join(rootFolder, START_FILE_NAME);
  fs.readFile(startFilePath, "utf8", (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(
        "Can't locate .start file in project root."
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

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "start.bootProject",
    function () {
      // console.log("Starting....")
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        // console.log("Acitve Editor URI :: ", activeEditor.document.uri)
        const workspaceRoot = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
        // parseStartFile(path.dirname(activeEditor.document.uri.fsPath));
        // console.log("Workspace root :: ", workspaceRoot, ", Path :: ", workspaceRoot.uri.fsPath);
        parseStartFile(workspaceRoot.uri.fsPath);
      } else {
        vscode.window.showInformationMessage("No active editor found.");
      } 
    }
  );

  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeWorkspaceFolders((event) => {
  //     if (event.added.length > 0) {
  //       parseStartFile(event.added[0].uri.fsPath);
  //     }
  //   })
  // );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
