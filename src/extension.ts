// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const { Client } = require("@notionhq/client");

const notion = new Client({
	auth: vscode.workspace.getConfiguration().get('code-block-to-notion.notionToken'),
});
const databaseId = vscode.workspace.getConfiguration().get('code-block-to-notion.databaseId');
const openByApp = vscode.workspace.getConfiguration().get('code-block-to-notion.openByApp');

const FILETYPES:any = {
	"ts": "typescript",
	"tsx": "typescript",
	"js": "javascript",
	"py": "python",
	"html": "html",
	"rb": "ruby",
	"css": "css",
	"tex": "latex",
	"sty": "latex",
	"m": "matlab",
	"rs": "rust",
	"swift": "swift",
	"yml": "yaml",
	"yaml": "yaml",
	"sh": "shell",
	"c": "c",
	"cpp": "c++",
	"h": "c",
	"json": "json",
	"java": "java",
	"md": "markdown",
	"ps1": "powershell",
	"php": "php",
	"elm": "elm",
	"r": "r",
	"pl": "perl",
	"txt": "plain text"
};

const appendCodeBlock = async (pageId: string, code: string, language: string) => {
	if (pageId === '') {
		vscode.window.showErrorMessage('Please create today page');
		return;
	}
	if (code === '') {
		vscode.window.showErrorMessage('Please enter some code');
		return;
	}
	if (language === '') {
		vscode.window.showErrorMessage('Please enter a language');
		return;
	}
	const response = await notion.blocks.children.append({
		block_id: pageId,
		children: [
			{
				"type": "code",
				"object": "block",
				"code": {
					"text": [{
						"type": "text",
						"text": {
							"content": code
						}
					}],
					"language": language
				}
			}
		],
	});
	return response;
};

async function getLastEditedPage() {
	let myPage;
	try {
		const lists = await notion.databases.query({
			database_id: databaseId,
			sorts: [
				{
					timestamp: "last_edited_time",
					direction: "descending"
				},
			],
			page_size: 1
		});
		myPage = lists.results[0];
	} catch (error) {
		return undefined;
	}
	return myPage;
}

const logic = async (editor: vscode.TextEditor | undefined) => {
	try {
		let codeBlock: string | undefined = editor?.document.getText(editor.selection);
		const filename: string[] | undefined = editor?.document.fileName.split('.');
		const fileType: string | undefined = filename?.slice(-1)[0];

		if (codeBlock === undefined) {
			vscode.window.showErrorMessage('Plaease select some code');
			return;
		}
		if (fileType === undefined) {
			vscode.window.showErrorMessage('Please select a file');
			return;
		}
		const language = FILETYPES[fileType] || "plain text";
		const myPage = await getLastEditedPage();
		if (myPage === undefined) {
			return;
		}
		const pageId = myPage.id;
		await appendCodeBlock(pageId, codeBlock, language);
		return myPage.url;
	} catch (err) {
		console.error(err);
		return null;
	}
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-block-to-notion" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-block-to-notion.toNotion', async () => {
		const editor = vscode.window.activeTextEditor;
		const url = await logic(editor);
		if (url) {
			vscode.window.showInformationMessage(`Append code block successfully`, 'open page').then(async (value) => {
				if (value === 'open page') {
					if (openByApp) {
						vscode.env.openExternal(vscode.Uri.parse(url.replace('https', 'notion')));
					} else {
						vscode.env.openExternal(vscode.Uri.parse(url));
					}
				}
			});
		} else {
			vscode.window.showErrorMessage('Could not create page -- check dev console');
		}
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
