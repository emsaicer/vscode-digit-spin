import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";

const digit_decoration_type = vscode.window.createTextEditorDecorationType({
	backgroundColor: `rgba(255, 235, 59, 0.4)`,
	border: `1px solid rgba(255, 235, 59, 0.8)`,
	borderRadius: `2px`,
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

let is_number_selected = false;
let selections: readonly vscode.Selection[];

export function activate(context: vscode.ExtensionContext) {
	let selected_numbers: SelectedNumber[] = [];

	const arrow_left_command = vscode.commands.registerCommand(`digit-spin.selectLeftDigit`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.select_left_digit());
	});

	const arrow_right_command = vscode.commands.registerCommand(`digit-spin.selectRightDigit`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.select_right_digit());
	});

	const arrow_up_command = vscode.commands.registerCommand(`digit-spin.changeDigitUp`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(1));
	});

	const arrow_down_command = vscode.commands.registerCommand(`digit-spin.changeDigitDown`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(-1));
	});

	const select_first_digit_command = vscode.commands.registerCommand(`digit-spin.selectFirstDigit`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.select_first_digit());
	});

	const select_last_digit_command = vscode.commands.registerCommand(`digit-spin.selectLastDigit`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.select_last_digit());
	});

	const delete_digit_command = vscode.commands.registerCommand(`digit-spin.deleteSelectedDigit`, async () => {
		await change_selected_numbers(selected_numbers, selected_number => selected_number.delete_selected_digit());
	});

	const select_number_command = vscode.commands.registerCommand(`digit-spin.selectNumber`, () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;
		const document = editor.document;
		selections = editor.selections;
		const number_regex = /-?\d+((\.|,)\d+)?/;
		for (const selection of selections) {
			const number_range = document.getWordRangeAtPosition(selection.active, number_regex);
			if (!number_range) {
				vscode.window.showInformationMessage(`Number was not found.`);
				return;
			}

			const number_start_offset = document.offsetAt(number_range.start);

			vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, true);
			is_number_selected = true;
			selected_numbers.push(new SelectedNumber(document.getText(number_range), number_start_offset));
		}

		const new_cursor_position = document.positionAt(selected_numbers[0].start_offset - 1);
		editor.selection = new vscode.Selection(new_cursor_position, new_cursor_position);

		update_digits_highlight(editor, selected_numbers);
	});

	const deselect_number_command = vscode.commands.registerCommand(`digit-spin.deselectNumber`, () => deselect_numbers(selected_numbers, true));

	const selection_change_command = vscode.window.onDidChangeTextEditorSelection(event => {
		if (is_number_selected && event.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
			deselect_numbers(selected_numbers, true);
		};
	});

	const deselect_number_command_and_save_zeros_command = vscode.commands.registerCommand(`digit-spin.deselectNumberAndDeleteZeros`, () => deselect_numbers(selected_numbers, false));

	const undo_interceptor = vscode.commands.registerCommand(`undo`, async () => {
		if (is_number_selected) await deselect_numbers(selected_numbers, true);
		await vscode.commands.executeCommand(`default:undo`);
	});

	const redo_interceptor = vscode.commands.registerCommand(`redo`, async () => {
		if (is_number_selected && selected_numbers[0].is_first_edit_state) {
			await deselect_numbers(selected_numbers, true);
		}
		await vscode.commands.executeCommand(`default:redo`);
	});

	context.subscriptions.push(select_number_command, deselect_number_command, selection_change_command, arrow_left_command, arrow_right_command, arrow_up_command, arrow_down_command, select_first_digit_command, select_last_digit_command, deselect_number_command_and_save_zeros_command, delete_digit_command, undo_interceptor, redo_interceptor);
}

function update_digits_highlight(editor: vscode.TextEditor, selected_numbers: SelectedNumber[]) {
	const document = editor.document;
	const decoration_ranges: vscode.Range[] = [];

	for (const selected_number of selected_numbers) {
		const start_offset = selected_number.get_selected_digit_offset() + selected_number.start_offset;

		decoration_ranges.push(new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + 1)));
	}
	editor.setDecorations(digit_decoration_type, decoration_ranges);
}

async function change_selected_numbers(selected_numbers: SelectedNumber[], changing_function: (selected_number: SelectedNumber) => void) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;
	const document = editor.document;

	for (const selected_number of selected_numbers) {
		const start_offset = selected_number.start_offset;
		const end_offset = selected_number.start_offset + selected_number.value_text_state.length;

		changing_function(selected_number);

		await editor.edit(editBuilder => {
			editBuilder.replace(new vscode.Range(document.positionAt(start_offset), document.positionAt(end_offset)), selected_number.value_text_state);
		}, { undoStopBefore: selected_number.is_first_edit_state, undoStopAfter: false });

		const offset_delta = selected_number.value_text_state.length - (end_offset - start_offset);

		for (const other_number of selected_numbers) {
			if (other_number.start_offset > selected_number.start_offset) {
				other_number.start_offset += offset_delta;
			}
		}
	}
	update_digits_highlight(editor, selected_numbers);
}

async function deselect_numbers(selected_numbers: SelectedNumber[], save_zeros: boolean) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	if (!save_zeros) {
		await change_selected_numbers(selected_numbers, selected_number => {
			selected_number.remove_all_left_zeros();
			selected_number.remove_all_right_zeros();
		});
	}
	editor.setDecorations(digit_decoration_type, []);
	vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, false);

	editor.selections = selections;
	selected_numbers.length = 0;
	is_number_selected = false;
}

export function deactivate() { }