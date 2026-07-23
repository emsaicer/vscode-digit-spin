import * as vscode from "vscode";
import * as assert from "assert";

suite(`All Tests`, () => {

	suite(`Select Number and Change Digits`, () => {

		test(`Increase by One`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `123` });
			const editor = await vscode.window.showTextDocument(document);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `124`);
		});

		test(`Increase by Ten`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `123` });
			const editor = await vscode.window.showTextDocument(document);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.selectLeftDigits`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `133`);
		});

		test(`Increase by One Tenth`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `123` });
			const editor = await vscode.window.showTextDocument(document);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.selectRightDigits`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `123.1`);
		});

		test(`Select One Number Using Several Selections`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `123` });
			const editor = await vscode.window.showTextDocument(document);

			const first_position = new vscode.Position(0, 0);
			const second_position = new vscode.Position(0, 1);
			const third_position = new vscode.Position(0, 2);

			editor.selections = [
				new vscode.Selection(first_position, first_position),
				new vscode.Selection(second_position, second_position),
				new vscode.Selection(third_position, third_position)
			];

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `124`);
		});

	});

	suite(`Deselect Numbers and Delete Zeros`, () => {

		test(`Delete Zeros in Integer and Fractional Parts`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `00123.4500` });
			const editor = await vscode.window.showTextDocument(document);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.deselectNumbersAndDeleteZeros`);

			assert.strictEqual(editor.document.getText(), `123.45`);
		});

	});

	suite(`Change Several Numbers`, () => {

		test(`Increase Several Numbers`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `1 2 3` });
			const editor = await vscode.window.showTextDocument(document);

			const first_position = new vscode.Position(0, 0);
			const second_position = new vscode.Position(0, 2);
			const third_position = new vscode.Position(0, 4);

			editor.selections = [
				new vscode.Selection(first_position, first_position),
				new vscode.Selection(second_position, second_position),
				new vscode.Selection(third_position, third_position)
			];

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `2 3 4`);
		});

		test(`Number Change Length`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `9 1` });
			const editor = await vscode.window.showTextDocument(document);

			const first_position = new vscode.Position(0, 0);
			const second_position = new vscode.Position(0, 2);

			editor.selections = [
				new vscode.Selection(first_position, first_position),
				new vscode.Selection(second_position, second_position),
			];

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `11 3`);
		});

	});

	suite(`Change Selected Digits Incrementally`, () => {

		test(`Increase and Decrease`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `0 0 0` });
			const editor = await vscode.window.showTextDocument(document);

			const first_position = new vscode.Position(0, 0);
			const second_position = new vscode.Position(0, 2);
			const third_position = new vscode.Position(0, 4);

			editor.selections = [
				new vscode.Selection(first_position, first_position),
				new vscode.Selection(second_position, second_position),
				new vscode.Selection(third_position, third_position)
			];

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUpIncrementally`);

			assert.strictEqual(editor.document.getText(), `1 2 3`);

			await vscode.commands.executeCommand(`digit-spin.changeDigitsDownIncrementally`);

			assert.strictEqual(editor.document.getText(), `0 0 0`);
		});

	});

	suite(`Select Adjacent Numbers`, () => {

		test(`Select Right Number`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `0 0` });
			const editor = await vscode.window.showTextDocument(document);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.selectNextNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `0 1`);
		});

		test(`Select Left Number`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `0 0` });
			const editor = await vscode.window.showTextDocument(document);

			const position = new vscode.Position(0, 2);
			editor.selection = new vscode.Selection(position, position);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.selectPreviousNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);

			assert.strictEqual(editor.document.getText(), `1 0`);
		});

	});

	suite(`Undo`, () => {

		test(`Undo Several Changes`, async () => {
			const document = await vscode.workspace.openTextDocument({ content: `123` });
			const editor = await vscode.window.showTextDocument(document);

			await vscode.commands.executeCommand(`digit-spin.selectNumbers`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);
			await vscode.commands.executeCommand(`digit-spin.changeDigitsUp`);
			await vscode.commands.executeCommand(`undo`);

			assert.strictEqual(editor.document.getText(), `123`);
		});

	});

});