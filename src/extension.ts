import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";
import { EditorChanger } from "./EditorChanger";

export function activate(context: vscode.ExtensionContext) {
	let selected_numbers: SelectedNumber[] = [];
	let editor_changer: EditorChanger;

	context.subscriptions.push(
		vscode.commands.registerCommand(`digit-spin.selectNumber`, () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			editor_changer = new EditorChanger(editor);
			selected_numbers = editor_changer.select_numbers(editor.selections);
			if (selected_numbers.length === 0) return;
			vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, true);
		}),

		vscode.commands.registerCommand(`digit-spin.selectLeftDigit`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_left_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectRightDigit`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_right_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitUp`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(1));
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitDown`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(-1));
		}),

		vscode.commands.registerCommand(`digit-spin.selectFirstDigit`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_first_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectLastDigit`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_last_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.deleteSelectedDigit`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.delete_selected_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitUpIncrementally`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => { change_selected_digit_incrementally(selected_number, 1); });
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitDownIncrementally`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => { change_selected_digit_incrementally(selected_number, -1); });
		}),

		vscode.commands.registerCommand(`digit-spin.selectNextNumber`, async () => {
			selected_numbers = editor_changer.select_adjacent_number(selected_numbers, `right`);
		}),

		vscode.commands.registerCommand(`digit-spin.selectPreviousNumber`, async () => {
			selected_numbers = editor_changer.select_adjacent_number(selected_numbers, `left`);
		}),

		vscode.commands.registerCommand(`digit-spin.deselectNumber`, () => { deselect_numbers(true); }),

		vscode.window.onDidChangeTextEditorSelection(async event => {
			if (!selected_numbers.length
				|| event.kind !== vscode.TextEditorSelectionChangeKind.Mouse) return;
			deselect_numbers(false);
		}),

		vscode.commands.registerCommand(`digit-spin.deselectNumberAndDeleteZeros`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => {
				selected_number.remove_all_left_zeros();
				selected_number.remove_all_right_zeros();
			});
			deselect_numbers(true);
		}),

		vscode.commands.registerCommand(`undo`, async () => {
			if (selected_numbers.length) deselect_numbers(true);
			await vscode.commands.executeCommand(`default:undo`);
		}),

		vscode.commands.registerCommand(`redo`, async () => {
			if (selected_numbers.length) deselect_numbers(true);
			await vscode.commands.executeCommand(`default:redo`);
		})
	);

	function deselect_numbers(restore_selections: boolean) {
		selected_numbers.length = 0;
		editor_changer.deselect_numbers(restore_selections);
		vscode.commands.executeCommand(`setContext`, `digit-spin.isNumberSelected`, false);
	}

	function change_selected_digit_incrementally(current_selected_number: SelectedNumber, direction: 1 | -1) {
		const current_selected_number_index = selected_numbers.findIndex(selected_number => selected_number.start_offset === current_selected_number.start_offset);

		for (let i = 0; i < current_selected_number_index + 1; i++) {
			current_selected_number.change_selected_digit(direction);
		}
	}
}

export function deactivate() { }