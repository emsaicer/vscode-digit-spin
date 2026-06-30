export class SelectedNumber {
	private value_text: string;
	private integer_part_length: number;
	private fractional_part_length: number;
	private selected_digit_index: number = 0;
	private is_first_edit: boolean = true;
	public readonly start_offset: number;

	constructor(value_text: string, start_offset: number) {
		this.value_text = value_text;
		this.start_offset = start_offset;
		const parts = String(this.value_text).split(/[.,]/);
		this.integer_part_length = parts[0].replace(`-`, ``).length;
		this.fractional_part_length = parts[1]?.length ?? 0;
	}

	public get value_text_state(): string {
		return this.value_text;
	}

	public get is_first_edit_state(): boolean {
		return this.is_first_edit;
	}

	private is_negative(): boolean {
		return this.value_text.startsWith(`-`);
	}

	private is_highest_digit_selected() {
		return this.selected_digit_index === this.integer_part_length - 1;
	}

	private is_lowest_digit_selected() {
		return this.selected_digit_index === -this.fractional_part_length;
	}

	private is_left_zero_selected(): boolean {
		let number_of_left_zeroes = this.value_text.replace(`-`, ``).match(/^0*/)?.[0].length ?? 0;

		return this.selected_digit_index > this.integer_part_length - number_of_left_zeroes - 1;
	}

	private has_left_zero(): boolean {
		return (this.value_text.startsWith(`0`) || this.value_text.startsWith(`-0`)) && this.integer_part_length > 1;
	}

	private has_right_zero(): boolean {
		return this.fractional_part_length !== 0 && this.value_text.endsWith(`0`);
	}

	private remove_left_zero() {
		if (!this.has_left_zero()) return;
		this.value_text = this.is_negative() ? this.value_text.replace(`-0`, `-`) : this.value_text.replace(`0`, ``);
		this.integer_part_length--;
		this.is_first_edit = false;
	}

	private remove_right_zero() {
		if (!this.has_right_zero()) return;
		this.value_text = this.value_text.slice(0, this.fractional_part_length === 1 ? -2 : -1);
		this.fractional_part_length--;
		this.is_first_edit = false;
	}

	public remove_all_left_zeros() {
		while (this.has_left_zero()) this.remove_left_zero();
	}

	public remove_all_right_zeros() {
		while (this.has_right_zero()) this.remove_right_zero();
	}

	public select_first_digit() {
		if (this.is_lowest_digit_selected()) this.remove_all_right_zeros();
		this.selected_digit_index = this.integer_part_length - 1;
	}

	public select_last_digit() {
		if (this.is_highest_digit_selected()) this.remove_all_left_zeros();
		this.selected_digit_index = this.fractional_part_length === 0 ? 0 : -this.fractional_part_length;
	}

	public select_left_digit() {
		// add zero to the left
		if (this.is_highest_digit_selected()) {
			this.value_text = !this.is_negative() ? `0${this.value_text}` : `-0${this.value_text.slice(1)}`;
			this.integer_part_length++;
			this.is_first_edit = false;
		};
		// remove zero from the right
		if (this.is_lowest_digit_selected() && this.has_right_zero()) {
			this.remove_right_zero();
		}
		this.selected_digit_index++;
	}

	public select_right_digit() {
		// add zero to the right
		if (this.is_lowest_digit_selected()) {
			// add fractional part
			this.value_text += this.fractional_part_length === 0 ? `.0` : `0`;
			this.fractional_part_length++;
			this.is_first_edit = false;
		};
		// remove zero from the left
		if (this.has_left_zero() && this.is_highest_digit_selected() && this.integer_part_length !== 1) {
			this.remove_left_zero();
		}
		this.selected_digit_index--;
	}

	public delete_selected_digit() {
		if (this.is_highest_digit_selected() && this.integer_part_length === 1) return;

		const selected_digit_offset = this.get_selected_digit_offset();

		this.value_text = this.value_text.slice(0, selected_digit_offset) + this.value_text.slice(selected_digit_offset + 1);
		if (this.is_highest_digit_selected()) this.selected_digit_index--;
		if (this.value_text.endsWith(`.`)) this.value_text = this.value_text.slice(0, -1);
		this.selected_digit_index < 0 ? this.fractional_part_length-- : this.integer_part_length--;
		if (this.selected_digit_index < 0) this.selected_digit_index++;
	}

	private replace_digit(digit_index: number, replacing_function: (digit_value: number) => number): number {
		const digit_offset = this.get_digit_offset(digit_index);
		const current_digit_value = Number(this.value_text[digit_offset]);
		const new_digit_value = replacing_function(current_digit_value);

		this.value_text = this.value_text.slice(0, digit_offset) + String(new_digit_value) + this.value_text.slice(digit_offset + 1);

		return new_digit_value;
	}

	private increase_digit(digit_index: number) {
		// add new digit
		if (digit_index === this.integer_part_length) {
			this.value_text = this.is_negative() ? this.value_text.replace(`-`, `-1`) : `1` + this.value_text;
			this.integer_part_length++;
			return;
		}

		const new_digit_value = this.replace_digit(digit_index, digit_value => (digit_value + 1) % 10);

		if (new_digit_value === 0) this.increase_digit(digit_index + 1);
	}

	private decrease_digit(digit_index: number) {
		if (this.value_text.startsWith(`0`)
			&& (this.is_highest_digit_selected() || this.is_left_zero_selected())) {
			this.value_text = `-` + this.value_text;
			return;
		}
		if (this.value_text.startsWith(`-0`)
			&& (this.is_highest_digit_selected() || this.is_left_zero_selected())) {
			this.value_text = this.value_text.slice(1);
			return;
		}

		const new_digit_value = this.replace_digit(digit_index, digit_value => digit_value === 0 ? 9 : digit_value - 1);

		if (this.has_left_zero()
			&& !this.is_highest_digit_selected()
			&& digit_index === this.integer_part_length - 1) {
			this.remove_left_zero();
		}

		if (new_digit_value === 9) this.decrease_digit(digit_index + 1);
	}

	public change_selected_digit(direction: 1 | -1) {
		(direction === 1) === !this.is_negative() ? this.increase_digit(this.selected_digit_index) : this.decrease_digit(this.selected_digit_index);
		this.is_first_edit = false;
	}

	private get_digit_offset(digit_index: number): number {
		if (digit_index >= 0) {
			return this.integer_part_length - digit_index - 1 + (this.is_negative() ? 1 : 0);
		}
		return this.integer_part_length + -digit_index + (this.is_negative() ? 1 : 0);
	}

	public get_selected_digit_offset(): number {
		return this.get_digit_offset(this.selected_digit_index);
	}
}