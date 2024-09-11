
<p align="center">
  <img src="./logo.png" alt="Logo" width="120"/>
</p>

<h1 align="center">Start (.start)</h1>

This is a Visual Studio Code (VSCode) extension that automatically starts your project by running commands specified in a `.start` file in the project root folder.

## Features

- Automatically creates new terminals and runs the commands specified in the `.start` file whenever you run the `Start projects` command.
- Supports multiple commands separated by commas, with each command running in a new terminal.
- Provides an easy way to set up and start your project without having to manually run the same commands every time.

## Installation

1. Open the VSCode Extension Marketplace by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).
2. Search for "start" and click on the "Install" button.
3. Once the extension is installed, you can start using it.

## Usage

1. Create a `.start` file in the root folder of your project or you can create multiple .startYourProjectName files.
2. In the `.start` or `.startYourProjectName` files, add the commands you want to run, with each command on a new line, prefixed with `\t`. For example: `\t cd server, source venv/bin/activate, python app.py`
3. Open the project in VSCode, and press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) and then choose `Start projects` command to start it.

## Example `.start` file

```bash
\t python -m venv venv
\t source venv/bin/activate, pip install -r requirements.txt
\t python app.py
```

## Configuration

This extension does not have any configurable options at the moment.

## Feedback and Contributions

If you have any feedback, suggestions, or want to contribute to the development of this extension, please visit the [GitHub repository](https://github.com/ashusharmadev/.start.git).

## License

This extension is licensed under the MIT License.