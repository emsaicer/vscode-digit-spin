import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";

const digit_decoration_type = vscode.window.createTextEditorDecorationType({
	backgroundColor: `oklch(0.55 0.25 260 / 0.4)`,
	border: `1px solid oklch(0.55 0.25 260 / 0.8)`,
	borderRadius: `2px`,
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

let is_number_selected = false;
let selections: readonly vscode.Selection[];
const number_regex = /-?\d+((\.|,)\d+)?/g;
let selected_numbers: SelectedNumber[] = [];

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand(`digit-spin.selectLeftDigit`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.select_left_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectRightDigit`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.select_right_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitUp`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(1));
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitUpIncrementally`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => { change_selected_digit_incrementally(selected_number, 1); });
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitDownIncrementally`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => { change_selected_digit_incrementally(selected_number, -1); });
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitDown`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(-1));
		}),

		vscode.commands.registerCommand(`digit-spin.selectFirstDigit`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.select_first_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectLastDigit`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.select_last_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.deleteSelectedDigit`, async () => {
			await change_selected_numbers(selected_numbers, selected_number => selected_number.delete_selected_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectNextNumber`, async () => { select_adjacent_number(selected_numbers, `right`); }),

		vscode.commands.registerCommand(`digit-spin.selectPreviousNumber`, async () => { select_adjacent_number(selected_numbers, `left`); }),

		vscode.commands.registerCommand(`digit-spin.selectNumber`, () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;
			const document = editor.document;
			selections = editor.selections;
			for (const selection of selections) {
				const number_range = document.getWordRangeAtPosition(selection.active, number_regex);
				if (!number_range) {
					vscode.window.showInformationMessage(`Number was not found.`);
					return;
				}

				vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, true);
				is_number_selected = true;
				selected_numbers.push(new SelectedNumber(document.getText(number_range), document.offsetAt(number_range.start)));
			}

			const new_cursor_position = document.positionAt(selected_numbers[0].start_offset - 1);
			editor.selection = new vscode.Selection(new_cursor_position, new_cursor_position);

			update_digits_highlight(editor, selected_numbers);
		}),

		vscode.commands.registerCommand(`digit-spin.deselectNumber`, () => deselect_numbers(selected_numbers, true)),

		vscode.window.onDidChangeTextEditorSelection(async event => {
			if (is_number_selected && event.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
				const editor = event.textEditor;
				const click_position = event.selections[0].active;

				await deselect_numbers(selected_numbers, true);
				editor.selection = new vscode.Selection(click_position, click_position);
			};
		}),

		vscode.commands.registerCommand(`digit-spin.deselectNumberAndDeleteZeros`, () => deselect_numbers(selected_numbers, false)),

		vscode.commands.registerCommand(`undo`, async () => {
			if (is_number_selected) await deselect_numbers(selected_numbers, true);
			await vscode.commands.executeCommand(`default:undo`);
		}),

		vscode.commands.registerCommand(`redo`, async () => {
			if (is_number_selected && selected_numbers[0].is_first_edit_state) {
				await deselect_numbers(selected_numbers, true);
			}
			await vscode.commands.executeCommand(`default:redo`);
		})
	);
}

function change_selected_digit_incrementally(current_selected_number: SelectedNumber, direction: 1 | -1) {
	const current_selected_number_index = selected_numbers.findIndex(selected_number => selected_number.start_offset === current_selected_number.start_offset);

	for (let i = 0; i < current_selected_number_index + 1; i++) {
		current_selected_number.change_selected_digit(direction);
	}
}

function select_adjacent_number(selected_numbers: SelectedNumber[], direction: `left` | `right`) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;
	const document = editor.document;
	const new_selected_numbers: Array<SelectedNumber> = [];

	for (const selected_number of selected_numbers) {
		let number_range = direction === `left`
			? get_previous_range(document, document.positionAt(selected_number.start_offset))
			: get_next_range(document, document.positionAt(selected_number.start_offset + selected_number.value_text_state.length));

		if (!number_range) {
			vscode.window.showInformationMessage(`Number was not found.`);
			return;
		}
		new_selected_numbers.push(new SelectedNumber(document.getText(number_range), document.offsetAt(number_range.start)));
	}

	selected_numbers.splice(0, selected_numbers.length, ...new_selected_numbers);
	update_digits_highlight(editor, selected_numbers);

	const first_selected_number = selected_numbers[0];
	const first_selected_number_position = document.positionAt(first_selected_number.start_offset);

	editor.revealRange(new vscode.Range(first_selected_number_position, first_selected_number_position.translate(0, first_selected_number.value_text_state.length)), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}

function get_next_range(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
	const full_text = document.getText();
	const regex = number_regex;
	regex.lastIndex = document.offsetAt(position);
	const match = regex.exec(full_text);
	if (!match) return undefined;
	const start_offset = match.index;

	return new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + match[0].length));
}

function get_previous_range(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
	const current_offset = document.offsetAt(position);
	const left_text = document.getText().substring(0, current_offset);
	const regex = new RegExp(`${number_regex.source}(?!.*${number_regex.source})`, `s`);
	const match = regex.exec(left_text);
	if (!match) return undefined;
	const start_offset = match.index;

	return new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + match[0].length));
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

	const new_offset_array = selected_numbers.map(selected_number => selected_number.start_offset);

	await editor.edit(editBuilder => {
		for (const selected_number of selected_numbers) {
			const start_offset = selected_number.start_offset;
			const end_offset = selected_number.start_offset + selected_number.value_text_state.length;

			changing_function(selected_number);

			editBuilder.replace(new vscode.Range(document.positionAt(start_offset), document.positionAt(end_offset)), selected_number.value_text_state);

			const offset_delta = selected_number.value_text_state.length - (end_offset - start_offset);

			for (let i = 0; i < selected_numbers.length; i++) {
				if (selected_numbers[i].start_offset > selected_number.start_offset) {
					new_offset_array[i] += offset_delta;
				}
			}
		}
	}, /* { undoStopBefore: selected_number.is_first_edit_state, undoStopAfter: false } */);

	for (let i = 0; i < selected_numbers.length; i++) {
		selected_numbers[i].start_offset = new_offset_array[i];
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