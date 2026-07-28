import * as vscode from "vscode";
import { SelectedNumber } from "./SelectedNumber";
import { ExtensionConfig } from "./config";

export class EditorChanger {
	private editor: vscode.TextEditor;
	private document: vscode.TextDocument;
	private original_selections: readonly vscode.Selection[] = [];
	private digits_decoration_type: vscode.TextEditorDecorationType;
	private number_regex: RegExp = /-?\d+((\.|,)\d+)?/g;
	private are_numbers_replaced: boolean = true;
	private config: ExtensionConfig;
	private has_changed_document: boolean = false;

	constructor(editor: vscode.TextEditor, config: ExtensionConfig) {
		this.editor = editor;
		this.document = this.editor.document;
		this.config = config;
		this.digits_decoration_type = vscode.window.createTextEditorDecorationType({
			backgroundColor: this.config.selected_digits_background_color,
			border: `1px solid ${this.config.selected_digits_border_color}`,
			borderRadius: `2px`,
			rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
		});
	}

	public get has_changed_document_state(): boolean {
		return this.has_changed_document;
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

			selected_numbers.push(new SelectedNumber(this.document.getText(number_range), this.document.offsetAt(number_range.start), this.config.default_decimal_separator));
		}

		this.original_selections = selections;
		const new_cursor_position = this.document.positionAt(selected_numbers[0].start_offset - 1);
		this.editor.selection = new vscode.Selection(new_cursor_position, new_cursor_position);

		this.update_digits_highlight(selected_numbers);

		// change and return focus to remove occurrencesHighlight
		vscode.commands.executeCommand(`workbench.action.blur`).then(() => {
			vscode.commands.executeCommand(`workbench.action.focusActiveEditorGroup`);
		});

		return selected_numbers;
	}

	private update_digits_highlight(selected_numbers: SelectedNumber[]): void {
		const decoration_ranges: vscode.Range[] = [];

		for (const selected_number of selected_numbers) {
			const start_offset = selected_number.get_selected_digit_offset() + selected_number.start_offset;

			decoration_ranges.push(new vscode.Range(this.document.positionAt(start_offset), this.document.positionAt(start_offset + 1)));
		}
		this.editor.setDecorations(this.digits_decoration_type, decoration_ranges);
	}

	public async change_selected_numbers(selected_numbers: SelectedNumber[], changing_function: (selected_number: SelectedNumber) => void): Promise<void> {
		const new_offsets_array = selected_numbers.map(selected_number => selected_number.start_offset);

		await this.editor.edit(editBuilder => {
			for (const selected_number of selected_numbers) {
				const start_offset = selected_number.start_offset;
				const end_offset = selected_number.start_offset + selected_number.value_text_state.length;
				const old_value_text = selected_number.value_text_state;

				changing_function(selected_number);
				if (old_value_text === selected_number.value_text_state) continue;

				editBuilder.replace(new vscode.Range(this.document.positionAt(start_offset), this.document.positionAt(end_offset)), selected_number.value_text_state);
				this.are_numbers_replaced = false;

				const offset_delta = selected_number.value_text_state.length - (end_offset - start_offset);

				if (offset_delta === 0) continue;

				for (let i = 0; i < selected_numbers.length; i++) {
					if (selected_numbers[i].start_offset > selected_number.start_offset) {
						new_offsets_array[i] += offset_delta;
					}
				}
			}
			this.has_changed_document = true;
		}, { undoStopBefore: this.are_numbers_replaced, undoStopAfter: false });

		for (let i = 0; i < selected_numbers.length; i++) {
			selected_numbers[i].start_offset = new_offsets_array[i];
		}

		this.update_digits_highlight(selected_numbers);
	}

	public select_adjacent_numbers(selected_numbers: SelectedNumber[], direction: `left` | `right`): SelectedNumber[] {
		const new_selected_numbers: Array<SelectedNumber> = [];

		for (const selected_number of selected_numbers) {
			const number_range = direction === `left`
				? this.get_previous_number_range(this.document.positionAt(selected_number.start_offset))
				: this.get_next_number_range(this.document.positionAt(selected_number.start_offset + selected_number.value_text_state.length));

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

	private get_next_number_range(position: vscode.Position): vscode.Range | undefined {
		const full_text = this.document.getText();
		const regex = this.number_regex;
		regex.lastIndex = this.document.offsetAt(position);
		const match = regex.exec(full_text);
		if (!match) return undefined;
		const start_offset = match.index;

		return new vscode.Range(this.document.positionAt(start_offset), this.document.positionAt(start_offset + match[0].length));
	}

	private get_previous_number_range(position: vscode.Position): vscode.Range | undefined {
		const current_offset = this.document.offsetAt(position);
		const left_text = this.document.getText().substring(0, current_offset);
		const regex = new RegExp(`${this.number_regex.source}(?!.*${this.number_regex.source})`, `s`);
		const match = regex.exec(left_text);
		if (!match) return undefined;
		const start_offset = match.index;

		return new vscode.Range(this.document.positionAt(start_offset), this.document.positionAt(start_offset + match[0].length));
	}

	public deselect_numbers(restore_selections: boolean): void {
		this.editor.setDecorations(this.digits_decoration_type, []);
		if (restore_selections) this.editor.selections = this.original_selections;
	}

	public reset_change_flag(): void {
		this.has_changed_document = false;
	}
}