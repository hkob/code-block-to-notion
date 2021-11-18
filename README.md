# code-block-to-notion README

Right click a code block in vsc and create a notion block to a selected page.

## How to install using vsix package

If you download `code-block-to-notion-x-y-z.vsix` file, please execute the following command.
```
code --install-extension code-block-to-notion-x.y.z.vsix
```

## How to build vsix package from source

After setting up yarn environment, please execute the following command.
```sh
yarn vsce package
```

## Extension Settings

* `code-block-to-notion.notionToken`: notion Token
* `code-block-to-notion.openByApp`: Set true if you want open the page by Notion.app


## Release Notes

### 0.1.2 (Add support)

Add almost languages

### 0.1.1 (Bug fix)

Fix language parameters (language parameters must not be Capital strings)

### 0.1.0 (Major Update)

Change to update the last edited page, rather than updating a specific page

### 0.0.2 (Add support)

Add some languages (Markdown, C++, Java, PHP, ...)

### 0.0.1

Initial release of code-block-to-notion