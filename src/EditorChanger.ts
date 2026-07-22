import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";

export class EditorChanger {
	private editor: vscode.TextEditor;
	private document: vscode.TextDocument;
	private original_selections: readonly vscode.Selection[] = [];
	private digit_decoration_type: vscode.TextEditorDecorationType;
	private number_regex: RegExp = /-?\d+((\.|,)\d+)?/g;
	private is_number_replaced: boolean = true;

	constructor(editor: vscode.TextEditor) {
		this.editor = editor;
		this.document = this.editor.document;
		this.digit_decoration_type = vscode.window.createTextEditorDecorationType({
			backgroundColor: `oklch(0.55 0.25 260 / 0.4)`,
			border: `1px solid oklch(0.55 0.25 260 / 0.8)`,
			borderRadius: `2px`,
			rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
		});
	}

	private update_digits_highlight(selected_numbers: SelectedNumber[]) {
		const document = this.editor.document;
		const decoration_ranges: vscode.Range[] = [];

		for (const selected_number of selected_numbers) {
			const start_offset = selected_number.get_selected_digit_offset() + selected_number.start_offset;

			decoration_ranges.push(new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + 1)));
		}
		this.editor.setDecorations(this.digit_decoration_type, decoration_ranges);
	}

	public select_numbers(selections: readonly vscode.Selection[]): SelectedNumber[] {
		const selected_numbers: SelectedNumber[] = [];

		for (const selection of selections) {
			const number_range = this.document.getWordRangeAtPosition(selection.active, this.number_regex);
			if (!number_range) {
				vscode.window.showWarningMessage(selections.length === 1 ? `Selection is not on the number.` : `At least one selection is not on the number.`);
				return [];
			}

			// don't add number if it is already added (several selections are on the same number)
			if (selected_numbers.find(selected_number => selected_number.start_offset === this.document.offsetAt(number_range.start))) continue;

			selected_numbers.push(new SelectedNumber(this.document.getText(number_range), this.document.offsetAt(number_range.start)));
		}

		this.original_selections = selections;
		const new_cursor_position = this.document.positionAt(selected_numbers[0].start_offset - 1);
		this.editor.selection = new vscode.Selection(new_cursor_position, new_cursor_position);

		this.update_digits_highlight(selected_numbers);

		return selected_numbers;
	}

	public async change_selected_numbers(selected_numbers: SelectedNumber[], changing_function: (selected_number: SelectedNumber) => void) {
		const new_offset_array = selected_numbers.map(selected_number => selected_number.start_offset);

		await this.editor.edit(editBuilder => {
			for (const selected_number of selected_numbers) {
				const start_offset = selected_number.start_offset;
				const end_offset = selected_number.start_offset + selected_number.value_text_state.length;
				const old_value_text = selected_number.value_text_state;

				changing_function(selected_number);
				if (old_value_text === selected_number.value_text_state) continue;

				editBuilder.replace(new vscode.Range(this.document.positionAt(start_offset), this.document.positionAt(end_offset)), selected_number.value_text_state);
				this.is_number_replaced = false;

				const offset_delta = selected_number.value_text_state.length - (end_offset - start_offset);

				if (offset_delta === 0) continue;

				for (let i = 0; i < selected_numbers.length; i++) {
					if (selected_numbers[i].start_offset > selected_number.start_offset) {
						new_offset_array[i] += offset_delta;
					}
				}
			}
		}, { undoStopBefore: this.is_number_replaced, undoStopAfter: false });

		for (let i = 0; i < selected_numbers.length; i++) {
			selected_numbers[i].start_offset = new_offset_array[i];
		}

		this.update_digits_highlight(selected_numbers);
	}

	public select_adjacent_numbers(selected_numbers: SelectedNumber[], direction: `left` | `right`): SelectedNumber[] {
		const new_selected_numbers: Array<SelectedNumber> = [];

		for (const selected_number of selected_numbers) {
			let number_range = direction === `left`
				? this.get_previous_number_range(this.document, this.document.positionAt(selected_number.start_offset))
				: this.get_next_number_range(this.document, this.document.positionAt(selected_number.start_offset + selected_number.value_text_state.length));

			if (!number_range) {
				vscode.window.showInformationMessage(`No number to select.`);
				return selected_numbers;
			}
			new_selected_numbers.push(new SelectedNumber(this.document.getText(number_range), this.document.offsetAt(number_range.start)));
		}

		this.update_digits_highlight(new_selected_numbers);

		const first_selected_number_position = this.document.positionAt(new_selected_numbers[0].start_offset);

		this.editor.revealRange(new vscode.Range(first_selected_number_position, first_selected_number_position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);

		return new_selected_numbers;
	}

	private get_next_number_range(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
		const full_text = document.getText();
		const regex = this.number_regex;
		regex.lastIndex = document.offsetAt(position);
		const match = regex.exec(full_text);
		if (!match) return undefined;
		const start_offset = match.index;

		return new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + match[0].length));
	}

	private get_previous_number_range(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
		const current_offset = document.offsetAt(position);
		const left_text = document.getText().substring(0, current_offset);
		const regex = new RegExp(`${this.number_regex.source}(?!.*${this.number_regex.source})`, `s`);
		const match = regex.exec(left_text);
		if (!match) return undefined;
		const start_offset = match.index;

		return new vscode.Range(document.positionAt(start_offset), document.positionAt(start_offset + match[0].length));
	}

	public deselect_numbers(restore_selections: boolean) {
		this.editor.setDecorations(this.digit_decoration_type, []);
		if (!restore_selections) return;
		this.editor.selections = this.original_selections;
	}
}