import "./utils/string";

export class SelectedNumber {
	private value_text: string;
	private integer_part_length: number;
	private fractional_part_length: number;
	private selected_digit_index: number = 0;
	private decimal_separator: string;
	public start_offset: number;

	constructor(value_text: string, start_offset: number, default_decimal_separator: `dot` | `comma` = `dot`) {
		this.value_text = value_text;
		this.start_offset = start_offset;
		const default_decimal_separator_sign = default_decimal_separator === `dot` ? `.` : `,`;
		this.decimal_separator = this.value_text.match(/[.,]/)?.[0] ?? default_decimal_separator_sign;
		const parts = this.value_text.split(this.decimal_separator);
		this.integer_part_length = parts[0].replace(`-`, ``).length;
		this.fractional_part_length = parts[1]?.length ?? 0;
	}

	public get value_text_state(): string {
		return this.value_text;
	}

	public select_left_digit() {
		// add zero to the left
		if (this.is_highest_digit_selected()) {
			this.value_text = this.value_text.insert_at(`0`, this.get_highest_digit_offset());
			this.integer_part_length++;
		}
		else if (this.is_lowest_digit_selected()) this.remove_extra_right_zero();
		this.selected_digit_index++;
	}

	public select_right_digit() {
		// add zero to the right
		if (this.is_lowest_digit_selected()) {
			this.value_text += this.fractional_part_length === 0 ? `${this.decimal_separator}0` : `0`;
			this.fractional_part_length++;
		}
		else if (this.is_highest_digit_selected()) this.remove_extra_left_zero();
		this.selected_digit_index--;
	}

	public change_selected_digit(direction: `up` | `down`) {
		(direction === `up`) === this.is_negative() ? this.decrease_digit(this.selected_digit_index) : this.increase_digit(this.selected_digit_index);
	}

	private increase_digit(digit_index: number) {
		// add new digit
		if (digit_index === this.integer_part_length) {
			this.value_text = this.value_text.insert_at(`1`, this.get_highest_digit_offset());
			this.integer_part_length++;
			return;
		}

		const new_digit_value = this.replace_digit(digit_index, digit_value => (digit_value + 1) % 10);

		if (new_digit_value === 0) this.increase_digit(digit_index + 1);
	}

	private decrease_digit(digit_index: number) {
		if (/-?0/.test(this.value_text) && (this.is_highest_digit_selected() || this.is_left_zero_selected())) {
			this.value_text = this.value_text.startsWith(`-`) ? this.value_text.remove_at(0) : `-${this.value_text}`;
			return;
		}

		const new_digit_value = this.replace_digit(digit_index, digit_value => digit_value === 0 ? 9 : digit_value - 1);

		if (digit_index === this.integer_part_length - 1 && !this.is_highest_digit_selected()) {
			this.remove_extra_left_zero();
		}
		if (new_digit_value === 9) this.decrease_digit(digit_index + 1);
	}

	private replace_digit(digit_index: number, replacing_function: (digit_value: number) => number): number {
		const digit_offset = this.get_digit_offset(digit_index);
		const current_digit_value = Number(this.value_text[digit_offset]);
		const new_digit_value = replacing_function(current_digit_value);

		this.value_text = this.value_text.replace_at(String(new_digit_value), digit_offset);

		return new_digit_value;
	}

	public move_decimal_separator_right() {
		if (this.fractional_part_length === 0) {
			this.value_text += `${this.decimal_separator}0`;
			this.fractional_part_length++;
		}

		const decimal_separator_offset = this.get_digit_offset(0) + 1;

		this.value_text = this.value_text.move_to(decimal_separator_offset, decimal_separator_offset + 1);
		this.remove_trailing_decimal_separator();
		this.integer_part_length++;
		this.fractional_part_length--;
		this.selected_digit_index++;
		if (!this.is_highest_digit_selected()) this.remove_extra_left_zero();
	}

	public move_decimal_separator_left() {
		if (this.fractional_part_length === 0) this.value_text += this.decimal_separator;

		const decimal_separator_offset = this.get_digit_offset(0) + 1;

		this.value_text = this.value_text.move_to(decimal_separator_offset, decimal_separator_offset - 1);
		if (/^-?[.,]/.test(this.value_text)) {
			this.value_text = this.value_text.insert_at(`0`, decimal_separator_offset - 1);
		}
		if (this.integer_part_length > 1) this.integer_part_length--;
		this.fractional_part_length++;
		this.selected_digit_index--;
		if (!this.is_lowest_digit_selected()) this.remove_extra_right_zero();
	}

	public delete_selected_digit() {
		if (this.is_highest_digit_selected() && this.integer_part_length === 1) return;
		this.value_text = this.value_text.remove_at(this.get_selected_digit_offset());
		if (this.is_highest_digit_selected()) this.selected_digit_index--;
		this.remove_trailing_decimal_separator();
		this.selected_digit_index < 0 ? this.fractional_part_length-- : this.integer_part_length--;
		if (this.selected_digit_index < 0) this.selected_digit_index++;
	}

	public select_first_digit() {
		if (this.is_lowest_digit_selected()) this.remove_all_extra_right_zeros();
		this.selected_digit_index = this.integer_part_length - 1;
	}

	public select_last_digit() {
		if (this.is_highest_digit_selected()) this.remove_all_extra_left_zeros();
		this.selected_digit_index = this.fractional_part_length === 0 ? 0 : -this.fractional_part_length;
	}

	public get_selected_digit_offset(): number {
		return this.get_digit_offset(this.selected_digit_index);
	}

	private get_digit_offset(digit_index: number): number {
		return this.get_highest_digit_offset() + this.integer_part_length - (digit_index >= 0 ? 1 : 0) - digit_index;
	}

	private get_highest_digit_offset(): number {
		return this.is_negative() ? 1 : 0;
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
		const number_of_left_zeroes = this.value_text.replace(`-`, ``).match(/^0*/)?.[0].length ?? 0;

		return this.selected_digit_index > this.integer_part_length - number_of_left_zeroes - 1;
	}

	public remove_all_extra_zeros() {
		this.remove_all_extra_left_zeros();
		this.remove_all_extra_right_zeros();
	}

	private remove_all_extra_left_zeros() {
		while (this.has_extra_left_zero()) this.remove_extra_left_zero();
	}

	private remove_all_extra_right_zeros() {
		while (this.has_extra_right_zero()) this.remove_extra_right_zero();
	}

	private remove_extra_left_zero() {
		if (!this.has_extra_left_zero()) return;
		this.value_text = this.value_text.replace(/^(-?)0/, `$1`);
		this.integer_part_length--;
	}

	private remove_extra_right_zero() {
		if (!this.has_extra_right_zero()) return;
		this.value_text = this.value_text.replace(/[.,]?0$/, ``);
		this.fractional_part_length--;
	}

	private has_extra_left_zero(): boolean {
		return (/^-?0\d+/.test(this.value_text));
	}

	private has_extra_right_zero(): boolean {
		return /[.,]\d*0$/.test(this.value_text);
	}

	private remove_trailing_decimal_separator() {
		this.value_text = this.value_text.replace(/[.,]$/, ``);
	}
}