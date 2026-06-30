import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";

const digit_decoration_type = vscode.window.createTextEditorDecorationType({
	backgroundColor: `rgba(255, 235, 59, 0.4)`,
	border: `1px solid rgba(255, 235, 59, 0.8)`,
	borderRadius: `2px`,
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

let is_number_selected = false;

export function activate(context: vscode.ExtensionContext) {
	let selected_number: SelectedNumber;

	const arrow_left_command = vscode.commands.registerCommand(`digit-spin.arrowLeft`, async () => {
		await change_selected_number(selected_number, () => selected_number.select_left_digit());
	});

	const arrow_right_command = vscode.commands.registerCommand(`digit-spin.arrowRight`, async () => {
		await change_selected_number(selected_number, () => selected_number.select_right_digit());
	});

	const arrow_up_command = vscode.commands.registerCommand(`digit-spin.arrowUp`, async () => {
		await change_selected_number(selected_number, () => selected_number.change_selected_digit(1));
	});

	const arrow_down_command = vscode.commands.registerCommand(`digit-spin.arrowDown`, async () => {
		await change_selected_number(selected_number, () => selected_number.change_selected_digit(-1));
	});

	const select_first_digit_command = vscode.commands.registerCommand(`digit-spin.selectFirstDigit`, async () => {
		await change_selected_number(selected_number, () => selected_number.select_first_digit());
	});

	const select_last_digit_command = vscode.commands.registerCommand(`digit-spin.selectLastDigit`, async () => {
		await change_selected_number(selected_number, () => selected_number.select_last_digit());
	});

	const delete_digit_command = vscode.commands.registerCommand(`digit-spin.deleteSelectedDigit`, async () => {
		await change_selected_number(selected_number, () => selected_number.delete_selected_digit());
	});

	const select_number_command = vscode.commands.registerCommand(`digit-spin.selectNumber`, () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;
		const document = editor.document;
		const position = editor.selection.active;
		const number_regex = /-?\d+(\.\d+)?/;
		const number_range = document.getWordRangeAtPosition(position, number_regex);
		if (!number_range) {
			vscode.window.showInformationMessage(`Number was not found.`);
			return;
		}
		const number_start_offset = document.offsetAt(number_range.start);

		// disable_highlight(editor);
		vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, true);
		is_number_selected = true;
		selected_number = new SelectedNumber(document.getText(number_range), number_start_offset);

		const last_line = editor.document.lineAt(editor.document.lineCount - 1);
		editor.selection = new vscode.Selection(last_line.range.end, last_line.range.end);

		update_digit_highlight(editor, selected_number);
	});

	const deselect_number_command = vscode.commands.registerCommand(`digit-spin.deselectNumber`, () => deselect_number(selected_number, true));

	const selection_change_command = vscode.window.onDidChangeTextEditorSelection(event => {
		if (is_number_selected && event.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
			deselect_number(selected_number, true);
		};
	});

	const deselect_number_command_and_save_zeros = vscode.commands.registerCommand(`digit-spin.deselectNumberAndDeleteZeros`, () => deselect_number(selected_number, false));

	context.subscriptions.push(select_number_command, deselect_number_command, selection_change_command, arrow_left_command, arrow_right_command, arrow_up_command, arrow_down_command, select_first_digit_command, select_last_digit_command, deselect_number_command_and_save_zeros, delete_digit_command);
}

function update_digit_highlight(editor: vscode.TextEditor, selected_number: SelectedNumber) {
	const document = editor.document;
	const start_offset = selected_number.get_selected_digit_offset() + selected_number.start_offset;
	const decoration_range = new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + 1));

	editor.setDecorations(digit_decoration_type, [decoration_range]);
}

async function change_selected_number(selected_number: SelectedNumber, changing_function: () => void) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;
	const document = editor.document;
	const start_offset = selected_number.start_offset;
	const end_offset = selected_number.start_offset + selected_number.value_text_state.length;

	changing_function();
	const success = await editor.edit(editBuilder => {
		editBuilder.replace(new vscode.Range(document.positionAt(start_offset), document.positionAt(end_offset)), selected_number.value_text_state);
	}, { undoStopBefore: selected_number.is_first_edit_state, undoStopAfter: false });
	if (success) {
		update_digit_highlight(editor, selected_number);
	}
}

async function deselect_number(selected_number: SelectedNumber, save_zeros: boolean) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	if (!save_zeros) {
		await change_selected_number(selected_number, () => {
			selected_number.remove_all_left_zeros();
			selected_number.remove_all_right_zeros();
		});
	}
	editor.setDecorations(digit_decoration_type, []);
	vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, false);
	const position = editor.document.positionAt(selected_number.start_offset + selected_number.value_text_state.length);
	editor.selection = new vscode.Selection(position, position);
	is_number_selected = false;
}

export function deactivate() { }

// async function disable_highlight(editor: vscode.TextEditor) {
// 	const config = vscode.workspace.getConfiguration(`editor`, editor.document.uri);

// 	await config.update(`occurrencesHighlight`, `off`, vscode.ConfigurationTarget.WorkspaceFolder);
// 	await config.update(`selectionHighlight`, false, vscode.ConfigurationTarget.WorkspaceFolder);
// }