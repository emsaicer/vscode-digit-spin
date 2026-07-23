import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";
import { EditorChanger } from "./EditorChanger";
import { ExtensionConfig } from "./config";

export function activate(context: vscode.ExtensionContext) {
	let selected_numbers: SelectedNumber[] = [];
	let editor_changer: EditorChanger;

	context.subscriptions.push(
		vscode.commands.registerCommand(`digit-spin.selectNumbers`, () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			const vscode_config = vscode.workspace.getConfiguration(`digitSpin`);
			const config: ExtensionConfig = {
				selected_digits_background_color: vscode_config.get<string>(`selectedDigitsBackgroundColor`, `oklch(0.55 0.25 260 / 0.4)`),
				selected_digits_border_color: vscode_config.get<string>(`selectedDigitsBorderColor`, `oklch(0.55 0.25 260 / 0.8)`),
				default_decimal_separator: vscode_config.get<`dot` | `comma`>(`defaultDecimalSeparator`, `dot`)
			};

			editor_changer = new EditorChanger(editor, config);
			selected_numbers = editor_changer.select_numbers(editor.selections);
			if (!are_numbers_selected()) return;
			vscode.commands.executeCommand(`setContext`, `digit-spin.areNumbersSelected`, true);
		}),

		vscode.commands.registerCommand(`digit-spin.selectLeftDigits`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_left_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectRightDigits`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_right_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitsUp`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(1));
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitsDown`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.change_selected_digit(-1));
		}),

		vscode.commands.registerCommand(`digit-spin.selectFirstDigits`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_first_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.selectLastDigits`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.select_last_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.deleteSelectedDigits`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => selected_number.delete_selected_digit());
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitsUpIncrementally`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => { change_selected_digits_incrementally(selected_number, 1); });
		}),

		vscode.commands.registerCommand(`digit-spin.changeDigitsDownIncrementally`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => { change_selected_digits_incrementally(selected_number, -1); });
		}),

		vscode.commands.registerCommand(`digit-spin.selectNextNumbers`, async () => {
			selected_numbers = editor_changer.select_adjacent_numbers(selected_numbers, `right`);
		}),

		vscode.commands.registerCommand(`digit-spin.selectPreviousNumbers`, async () => {
			selected_numbers = editor_changer.select_adjacent_numbers(selected_numbers, `left`);
		}),

		vscode.commands.registerCommand(`digit-spin.deselectNumbers`, () => deselect_numbers(true)),

		vscode.window.onDidChangeTextEditorSelection(async event => {
			if (!are_numbers_selected()) return;
			if (event.kind === vscode.TextEditorSelectionChangeKind.Mouse) deselect_numbers(false);
		}),

		vscode.workspace.onDidChangeTextDocument(event => {
			if (!are_numbers_selected() || event.contentChanges.length === 0) return;
			editor_changer.has_changed_document_state ? editor_changer.reset_change_flag() : deselect_numbers(false);
		}),

		vscode.window.onDidChangeActiveTextEditor(() => deselect_numbers(false)),

		vscode.commands.registerCommand(`digit-spin.deselectNumbersAndDeleteZeros`, async () => {
			await editor_changer.change_selected_numbers(selected_numbers, selected_number => {
				selected_number.remove_all_left_zeros();
				selected_number.remove_all_right_zeros();
			});
			deselect_numbers(true);
		}),

		vscode.commands.registerCommand(`undo`, async () => {
			if (are_numbers_selected()) deselect_numbers(true);
			await vscode.commands.executeCommand(`default:undo`);
		}),

		vscode.commands.registerCommand(`redo`, async () => {
			if (are_numbers_selected()) deselect_numbers(true);
			await vscode.commands.executeCommand(`default:redo`);
		})
	);

	function deselect_numbers(restore_selections: boolean) {
		selected_numbers.length = 0;
		editor_changer.deselect_numbers(restore_selections);
		vscode.commands.executeCommand(`setContext`, `digit-spin.areNumbersSelected`, false);
	}

	function change_selected_digits_incrementally(current_selected_number: SelectedNumber, direction: 1 | -1) {
		const current_selected_number_index = selected_numbers.findIndex(selected_number => selected_number.start_offset === current_selected_number.start_offset);

		for (let i = 0; i < current_selected_number_index + 1; i++) {
			current_selected_number.change_selected_digit(direction);
		}
	}

	function are_numbers_selected() {
		return selected_numbers.length > 0;
	}
}

export function deactivate() { }