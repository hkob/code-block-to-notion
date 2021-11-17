// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const { Client } = require("@notionhq/client");

const notion = new Client({
	auth: vscode.workspace.getConfiguration().get('code-block-to-notion.notionToken'),
});
const databaseId = vscode.workspace.getConfiguration().get('code-block-to-notion.databaseId');
const titleTaskName = vscode.workspace.getConfiguration().get('code-block-to-notion.titleTaskName');
const titleTaskDate = vscode.workspace.getConfiguration().get('code-block-to-notion.titleTaskDate');
const pageTitle = vscode.workspace.getConfiguration().get('code-block-to-notion.pageTitle');
const openByApp = vscode.workspace.getConfiguration().get('code-block-to-notion.openByApp');

const FILETYPES:any = {
	"ts": "typescript",
	"tsx": "typescript",
	"js": "javascript",
	"py": "python",
	"html": "html",
	"haml": "haml",
	"rb": "ruby",
	"css": "css",
	"tex": "LaTeX",
	"sty": "LaTeX",
	"m": "MATLAB",
	"rs": "Rust",
	"swift": "Swift",
	"yml": "YAML",
	"sh": "Shell",
	"c": "C",
	"h": "C"
};

const appendCodeBlock = async (pageId: string, code: string, language: string) => {
	if (pageId === '') {
		vscode.window.showErrorMessage('Pleage create today page');
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

async function getTodayPage() {
	let myPage;
	try {
		var d = new Date();
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		const lists = await notion.databases.query({
			database_id: databaseId,
			filter: {
				and: [
					{
						property: titleTaskName,
						text: {
							starts_with: pageTitle,
						},
					},
					{
						property: titleTaskDate,
						date: {
							after: d.toISOString(),
						},
					},
				],
			},
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
		const language = FILETYPES[fileType];
		if (language === undefined) {
			vscode.window.showErrorMessage('Please select a valid file');
			return;
		}
		const myPage = await getTodayPage();
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
