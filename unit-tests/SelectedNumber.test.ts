import { SelectedNumber } from '/src/SelectedNumber';
import { describe, test, expect } from "bun:test";

describe(`Calculate Parts Length`, () => {

	test(`Positive Number without Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		expect(selected_number[`integer_part_length`]).toBe(4);
		expect(selected_number[`fractional_part_length`]).toBe(0);
	});

	test(`Positive Number with Fractional Part with Decimal Point.`, () => {
		const selected_number = new SelectedNumber(`123.12`, 0);

		expect(selected_number[`integer_part_length`]).toBe(3);
		expect(selected_number[`fractional_part_length`]).toBe(2);
	});

	test(`Negative Number with Fractional Part with Decimal Point`, () => {
		const selected_number = new SelectedNumber(`-123.12`, 0);

		expect(selected_number[`integer_part_length`]).toBe(3);
		expect(selected_number[`fractional_part_length`]).toBe(2);
	});

	test(`Positive Number with Fractional Part with Decimal Comma.`, () => {
		const selected_number = new SelectedNumber(`123,12`, 0);

		expect(selected_number[`integer_part_length`]).toBe(3);
		expect(selected_number[`fractional_part_length`]).toBe(2);
	});

});

describe(`selected_digit_index()`, () => {

	test(`Positive Number. Greatest Digit is Selected`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`selected_digit_index`] = 3;
		expect(selected_number[`is_highest_digit_selected`]()).toBe(true);
	});

	test(`Positive Number. Greatest Digit is Not Selected`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`selected_digit_index`] = 1;
		expect(selected_number[`is_highest_digit_selected`]()).toBe(false);
	});

	test(`Negative Number. Greatest Digit is Selected`, () => {
		const selected_number = new SelectedNumber(`-1234`, 0);

		selected_number[`selected_digit_index`] = 3;
		expect(selected_number[`is_highest_digit_selected`]()).toBe(true);
	});

	test(`Positive Number with Left Zeros. Greatest Digit is Selected`, () => {
		const selected_number = new SelectedNumber(`001234`, 0);

		selected_number[`selected_digit_index`] = 5;
		expect(selected_number[`is_highest_digit_selected`]()).toBe(true);
	});

	test(`Positive Number with Left Zeros. Greatest Digit is Not Selected`, () => {
		const selected_number = new SelectedNumber(`001234`, 0);

		selected_number[`selected_digit_index`] = 3;
		expect(selected_number[`is_highest_digit_selected`]()).toBe(false);
	});

});

describe(`is_left_zero_selected()`, () => {

	test(`Positive Number. Left Zero is Selected`, () => {
		const selected_number = new SelectedNumber(`001234`, 0);

		selected_number[`selected_digit_index`] = 4;
		expect(selected_number[`is_left_zero_selected`]()).toBe(true);
	});

	test(`Positive Number. Left Zero is Not Selected`, () => {
		const selected_number = new SelectedNumber(`001234`, 0);

		selected_number[`selected_digit_index`] = 2;
		expect(selected_number[`is_left_zero_selected`]()).toBe(false);
	});

	test(`Negative Number. Left Zero is Selected`, () => {
		const selected_number = new SelectedNumber(`-001234`, 0);

		selected_number[`selected_digit_index`] = 4;
		expect(selected_number[`is_left_zero_selected`]()).toBe(true);
	});

});

describe(`remove_extra_left_zero()`, () => {

	test(`Positive Number without Left Zeros`, () => {
		const selected_number = new SelectedNumber(`1234.123`, 0);

		selected_number[`remove_extra_left_zero`]();
		expect(selected_number.value_text_state).toBe(`1234.123`);
	});

	test(`Positive Number with One Left Zero`, () => {
		const selected_number = new SelectedNumber(`01234.123`, 0);

		selected_number[`remove_extra_left_zero`]();
		expect(selected_number.value_text_state).toBe(`1234.123`);
	});

	test(`Positive Number with Several Left Zeros`, () => {
		const selected_number = new SelectedNumber(`001234.123`, 0);

		selected_number[`remove_extra_left_zero`]();
		expect(selected_number.value_text_state).toBe(`01234.123`);
	});

	test(`Negative Number without Left Zeros`, () => {
		const selected_number = new SelectedNumber(`-1234.123`, 0);

		selected_number[`remove_extra_left_zero`]();
		expect(selected_number.value_text_state).toBe(`-1234.123`);
	});

	test(`Negative Number with One Left Zero`, () => {
		const selected_number = new SelectedNumber(`-01234.123`, 0);

		selected_number[`remove_extra_left_zero`]();
		expect(selected_number.value_text_state).toBe(`-1234.123`);
	});

	test(`Negative Number with Several Left Zeros`, () => {
		const selected_number = new SelectedNumber(`-001234.123`, 0);

		selected_number[`remove_extra_left_zero`]();
		expect(selected_number.value_text_state).toBe(`-01234.123`);
	});

});

describe(`remove_extra_right_zero()`, () => {

	test(`Positive Number without Right Zeros`, () => {
		const selected_number = new SelectedNumber(`1234.123`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`1234.123`);
	});

	test(`Positive Number with One Right Zero`, () => {
		const selected_number = new SelectedNumber(`1234.1230`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`1234.123`);
	});

	test(`Positive Number with Several Right Zeros`, () => {
		const selected_number = new SelectedNumber(`1234.12300`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`1234.1230`);
	});

	test(`Negative Number without Right Zeros`, () => {
		const selected_number = new SelectedNumber(`-1234.123`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`-1234.123`);
	});

	test(`Negative Number with One Right Zero`, () => {
		const selected_number = new SelectedNumber(`-1234.1230`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`-1234.123`);
	});

	test(`Negative Number with Several Right Zeros`, () => {
		const selected_number = new SelectedNumber(`-1234.12300`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`-1234.1230`);
	});

	test(`Right Zero with One Digit in Fractional Part with Decimal Point`, () => {
		const selected_number = new SelectedNumber(`1234.0`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`1234`);
	});

	test(`Right Zero with One Digit in Fractional Part with Decimal Comma`, () => {
		const selected_number = new SelectedNumber(`1234,0`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`1234`);
	});

	test(`Right Zero without Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1230`, 0);

		selected_number[`remove_extra_right_zero`]();
		expect(selected_number.value_text_state).toBe(`1230`);
	});

});

describe(`remove_all_extra_left_zeros()`, () => {

	test(`Positive Number with Several Left Zeros`, () => {
		const selected_number = new SelectedNumber(`0001234.123`, 0);

		selected_number[`remove_all_extra_left_zeros`]();
		expect(selected_number.value_text_state).toBe(`1234.123`);
	});

});

describe(`remove_all_extra_right_zeros()`, () => {

	test(`Positive Number with Several Right Zeros`, () => {
		const selected_number = new SelectedNumber(`1234.123000`, 0);

		selected_number[`remove_all_extra_right_zeros`]();
		expect(selected_number.value_text_state).toBe(`1234.123`);
	});

});

describe(`select_first_digit()`, () => {

	test(`Several Right Zeros. Lowest Digit is Selected`, () => {
		const selected_number = new SelectedNumber(`1234.12000`, 0);

		selected_number[`selected_digit_index`] = -5;
		selected_number.select_first_digit();
		expect(selected_number.value_text_state).toBe(`1234.12`);
		expect(selected_number[`selected_digit_index`]).toBe(3);
	});

	test(`Several Right Zeros. Lowest Digit is Not Selected`, () => {
		const selected_number = new SelectedNumber(`1234.12000`, 0);

		selected_number[`selected_digit_index`] = -3;
		selected_number.select_first_digit();
		expect(selected_number.value_text_state).toBe(`1234.12000`);
		expect(selected_number[`selected_digit_index`]).toBe(3);
	});

});

describe(`select_last_digit()`, () => {

	test(`Several Left Zeros. Greatest Digit is Selected`, () => {
		const selected_number = new SelectedNumber(`0001234`, 0);

		selected_number[`selected_digit_index`] = 6;
		selected_number.select_last_digit();
		expect(selected_number.value_text_state).toBe(`1234`);
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

	test(`Several Left Zeros. Greatest Digit is Not Selected`, () => {
		const selected_number = new SelectedNumber(`0001234`, 0);

		selected_number[`selected_digit_index`] = 4;
		selected_number.select_last_digit();
		expect(selected_number.value_text_state).toBe(`0001234`);
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

});

describe(`select_right_digit()`, () => {

	test(`Select Right Digit`, () => {
		const selected_number = new SelectedNumber(`1234.12`, 0);

		selected_number[`selected_digit_index`] = 1;
		selected_number.select_right_digit();
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

	test(`Positive Number. Remove Left Zero`, () => {
		const selected_number = new SelectedNumber(`01234.12`, 0);

		selected_number[`selected_digit_index`] = 4;
		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`1234.12`);
	});

	test(`Negative Number. Remove Left Zero`, () => {
		const selected_number = new SelectedNumber(`-01234.12`, 0);

		selected_number[`selected_digit_index`] = 4;
		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`-1234.12`);
	});

	test(`Add Right Zero in Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1234.12`, 0);

		selected_number[`selected_digit_index`] = -2;
		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`1234.120`);
	});

	test(`Add Right Zero and Create Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`1234.0`);
	});

	test(`Add Right Zero and Create Fractional Part. Default Decimal Separator is Comma`, () => {
		const selected_number = new SelectedNumber(`1234`, 0, `comma`);

		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`1234,0`);
	});

	test(`Number is 0. Add Right Zero and Create Fractional Part`, () => {
		const selected_number = new SelectedNumber(`0`, 0);

		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`0.0`);
	});

	test(`Positive Number. Several Extra Zeros on Left.`, () => {
		const selected_number = new SelectedNumber(`00123`, 0);

		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`00123.0`);
	});

});

describe(`select_left_digit()`, () => {

	test(`Select Left Digit`, () => {
		const selected_number = new SelectedNumber(`1234.12`, 0);

		selected_number[`selected_digit_index`] = 1;
		selected_number.select_left_digit();
		expect(selected_number[`selected_digit_index`]).toBe(2);
	});

	test(`Positive Number. Add Left Zero`, () => {
		const selected_number = new SelectedNumber(`1234.12`, 0);

		selected_number[`selected_digit_index`] = 3;
		selected_number.select_left_digit();
		expect(selected_number.value_text_state).toBe(`01234.12`);
	});

	test(`Negative Number. Add Left Zero`, () => {
		const selected_number = new SelectedNumber(`-1234.12`, 0);

		selected_number[`selected_digit_index`] = 3;
		selected_number.select_left_digit();
		expect(selected_number.value_text_state).toBe(`-01234.12`);
	});

	test(`Positive Number. Remove Right Zero`, () => {
		const selected_number = new SelectedNumber(`1234.120`, 0);

		selected_number[`selected_digit_index`] = -3;
		selected_number.select_left_digit();
		expect(selected_number.value_text_state).toBe(`1234.12`);
	});

	test(`Positive Number. Several Zeros in Fractional Part.`, () => {
		const selected_number = new SelectedNumber(`123.000`, 0);

		selected_number.select_left_digit();
		expect(selected_number.value_text_state).toBe(`123.000`);
	});

});

describe(`increase_digit()`, () => {

	test(`Positive Number. Increase by One`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`increase_digit`](0);
		expect(selected_number.value_text_state).toBe(`1235`);
	});

	test(`Positive Number. Increase by Ten`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`increase_digit`](1);
		expect(selected_number.value_text_state).toBe(`1244`);
	});

	test(`Positive Number. Increase with Carry`, () => {
		const selected_number = new SelectedNumber(`1239`, 0);

		selected_number[`increase_digit`](0);
		expect(selected_number.value_text_state).toBe(`1240`);
	});

	test(`Positive Number. Increase with Carry from Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1234.9`, 0);

		selected_number[`selected_digit_index`] = -1;
		selected_number[`increase_digit`](-1);
		expect(selected_number.value_text_state).toBe(`1235.0`);
	});

	test(`Positive Number. Increase with New Digit Creation`, () => {
		const selected_number = new SelectedNumber(`9234`, 0);

		selected_number[`increase_digit`](3);
		expect(selected_number.value_text_state).toBe(`10234`);
		expect(selected_number[`integer_part_length`]).toBe(5);
	});

	test(`Negative Number. Increase by One`, () => {
		const selected_number = new SelectedNumber(`-1234`, 0);

		selected_number[`increase_digit`](0);
		expect(selected_number.value_text_state).toBe(`-1235`);
	});

	test(`Negative Number. Increase with New Digit Creation`, () => {
		const selected_number = new SelectedNumber(`-9234`, 0);

		selected_number[`increase_digit`](3);
		expect(selected_number.value_text_state).toBe(`-10234`);
	});

	test(`Positive Number with Left Zero. Increase by One`, () => {
		const selected_number = new SelectedNumber(`01234`, 0);

		selected_number[`increase_digit`](0);
		expect(selected_number.value_text_state).toBe(`01235`);
	});

	test(`Positive Number with Left Zero. Increase by One. Create New Digit`, () => {
		const selected_number = new SelectedNumber(`09234`, 0);

		selected_number[`increase_digit`](3);
		expect(selected_number.value_text_state).toBe(`10234`);
	});

});

describe(`decrease_digit()`, () => {

	test(`Positive Number. Decrease by One`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`decrease_digit`](0);
		expect(selected_number.value_text_state).toBe(`1233`);
	});

	test(`Positive Number. Decrease by Ten`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`decrease_digit`](1);
		expect(selected_number.value_text_state).toBe(`1224`);
	});

	test(`Positive Number. Decrease with Borrow`, () => {
		const selected_number = new SelectedNumber(`1230`, 0);

		selected_number[`decrease_digit`](0);
		expect(selected_number.value_text_state).toBe(`1229`);
	});

	test(`Positive Number. Decrease and Delete a Digit`, () => {
		const selected_number = new SelectedNumber(`1034`, 0);

		selected_number[`decrease_digit`](2);
		expect(selected_number.value_text_state).toBe(`934`);
	});

	test(`Positive Number. Decrease and Add Left Zero`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`selected_digit_index`] = 3;
		selected_number[`decrease_digit`](3);
		expect(selected_number.value_text_state).toBe(`0234`);
	});

	test(`Positive Number. Decrease and Create Negative Number`, () => {
		const selected_number = new SelectedNumber(`0234`, 0);

		selected_number[`selected_digit_index`] = 3;
		selected_number[`decrease_digit`](3);
		expect(selected_number.value_text_state).toBe(`-0234`);
	});

	test(`Negative Number. Decrease by One`, () => {
		const selected_number = new SelectedNumber(`-1234`, 0);

		selected_number[`decrease_digit`](0);
		expect(selected_number.value_text_state).toBe(`-1233`);
	});

	test(`Negative Number. Decrease and Delete a Digit`, () => {
		const selected_number = new SelectedNumber(`-1034`, 0);

		selected_number[`decrease_digit`](2);
		expect(selected_number.value_text_state).toBe(`-934`);
	});

	test(`Negative Number. Decrease and Create Positive Number`, () => {
		const selected_number = new SelectedNumber(`-0234`, 0);

		selected_number[`selected_digit_index`] = 3;
		selected_number[`decrease_digit`](3);
		expect(selected_number.value_text_state).toBe(`0234`);
	});

	test(`Positive Number with Left Zeros. Decrease and Create Negative Number`, () => {
		const selected_number = new SelectedNumber(`001234`, 0);

		selected_number[`selected_digit_index`] = 4;
		selected_number[`decrease_digit`](4);
		expect(selected_number.value_text_state).toBe(`-001234`);
	});

	test(`Negative Number with Left Zeros. Decrease and Create Positive Number`, () => {
		const selected_number = new SelectedNumber(`-001234`, 0);

		selected_number[`selected_digit_index`] = 4;
		selected_number[`decrease_digit`](4);
		expect(selected_number.value_text_state).toBe(`001234`);
	});

});

describe(`change_selected_digit()`, () => {

	test(`Positive Number. Direction: Up. Increase by One`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number.change_selected_digit(`up`);
		expect(selected_number.value_text_state).toBe(`1235`);
	});

	test(`Positive Number. Direction: Down. Decrease by One`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number.change_selected_digit(`down`);
		expect(selected_number.value_text_state).toBe(`1233`);
	});

	test(`Negative Number. Direction: Up. Increase by One`, () => {
		const selected_number = new SelectedNumber(`-1234`, 0);

		selected_number.change_selected_digit(`up`);
		expect(selected_number.value_text_state).toBe(`-1233`);
	});

	test(`Negative Number. Direction: Down. Decrease by One`, () => {
		const selected_number = new SelectedNumber(`-1234`, 0);

		selected_number.change_selected_digit(`down`);
		expect(selected_number.value_text_state).toBe(`-1235`);
	});

});

describe(`get_digit_offset()`, () => {

	test(`First Digit is Selected`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		selected_number[`selected_digit_index`] = 3;
		expect(selected_number.get_selected_digit_offset()).toBe(0);
	});

	test(`Digit Representing Ones is Selected`, () => {
		const selected_number = new SelectedNumber(`1234`, 0);

		expect(selected_number.get_selected_digit_offset()).toBe(3);
	});

	test(`Digit Representing Tenths is Selected`, () => {
		const selected_number = new SelectedNumber(`1234.1`, 0);

		selected_number[`selected_digit_index`] = -1;
		expect(selected_number.get_selected_digit_offset()).toBe(5);
	});

});

describe(`delete_selected_digit()`, () => {

	test(`Delete Digit in Integer Part`, () => {
		const selected_number = new SelectedNumber(`1234.12`, 0);

		selected_number.delete_selected_digit();
		expect(selected_number.value_text_state).toBe(`123.12`);
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

	test(`Delete Digit in Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1234.12`, 0);

		selected_number[`selected_digit_index`] = -2;
		selected_number.delete_selected_digit();
		expect(selected_number.value_text_state).toBe(`1234.1`);
		expect(selected_number[`selected_digit_index`]).toBe(-1);
	});

	test(`Delete Digit in Fractional Part. Delete Fractional Part with Decimal Point`, () => {
		const selected_number = new SelectedNumber(`1234.1`, 0);

		selected_number[`selected_digit_index`] = -1;
		selected_number.delete_selected_digit();
		expect(selected_number.value_text_state).toBe(`1234`);
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

	test(`Delete Digit in Fractional Part. Delete Fractional Part with Decimal Comma`, () => {
		const selected_number = new SelectedNumber(`1234,1`, 0);

		selected_number[`selected_digit_index`] = -1;
		selected_number.delete_selected_digit();
		expect(selected_number.value_text_state).toBe(`1234`);
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

	test(`Try to Delete Digit When There is One Digit in Fractional Part`, () => {
		const selected_number = new SelectedNumber(`1`, 0);

		selected_number.delete_selected_digit();
		expect(selected_number.value_text_state).toBe(`1`);
		expect(selected_number[`selected_digit_index`]).toBe(0);
	});

	test(`Delete Digit and Remember Decimal Separator. Decimal Separator is Dot`, () => {
		const selected_number = new SelectedNumber(`123.4`, 0);

		selected_number[`selected_digit_index`] = -1;
		selected_number.delete_selected_digit();
		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`123.0`);
	});

	test(`Delete Digit and Remember Decimal Separator. Decimal Separator is Comma`, () => {
		const selected_number = new SelectedNumber(`123,4`, 0);

		selected_number[`selected_digit_index`] = -1;
		selected_number.delete_selected_digit();
		selected_number.select_right_digit();
		expect(selected_number.value_text_state).toBe(`123,0`);
	});

});

describe(`move_decimal_separator_left()`, () => {
	const test_cases: [
		selected_number: SelectedNumber,
		expected_value_text: string,
		expected_integer_part_length: number,
		expected_fractional_part_length: number,
		expected_selected_digit_index: number,
		selected_digit_index?: number,
	][] = [
			[new SelectedNumber(`123.45`, 0), `12.345`, 2, 3, -1],
			[new SelectedNumber(`-123.45`, 0), `-12.345`, 2, 3, -1],
			[new SelectedNumber(`123,45`, 0), `12,345`, 2, 3, -1],
			[new SelectedNumber(`-123,45`, 0), `-12,345`, 2, 3, -1],

			[new SelectedNumber(`123`, 0), `12.3`, 2, 1, -1],
			[new SelectedNumber(`-123`, 0), `-12.3`, 2, 1, -1],
			[new SelectedNumber(`123`, 0, `comma`), `12,3`, 2, 1, -1],
			[new SelectedNumber(`-123`, 0, `comma`), `-12,3`, 2, 1, -1],

			[new SelectedNumber(`1.23`, 0), `0.123`, 1, 3, -1],
			[new SelectedNumber(`-1.23`, 0), `-0.123`, 1, 3, -1],
			[new SelectedNumber(`1,23`, 0), `0,123`, 1, 3, -1],
			[new SelectedNumber(`-1,23`, 0), `-0,123`, 1, 3, -1],

			[new SelectedNumber(`1230`, 0), `123`, 3, 0, 0],
			[new SelectedNumber(`-1230`, 0), `-123`, 3, 0, 0],
			[new SelectedNumber(`1230`, 0), `123`, 3, 0, 0, 1],
			[new SelectedNumber(`-1230`, 0), `-123`, 3, 0, 0, 1],

			[new SelectedNumber(`1`, 0), `0.1`, 1, 1, -1],
			[new SelectedNumber(`-1`, 0), `-0.1`, 1, 1, -1],
			[new SelectedNumber(`1`, 0, `comma`), `0,1`, 1, 1, -1],
			[new SelectedNumber(`-1`, 0, `comma`), `-0,1`, 1, 1, -1]
		];

	for (const [selected_number, expected_value_text, expected_integer_part_length, expected_fractional_part_length, expected_selected_digit_index, selected_digit_index] of test_cases) {
		const fractional_part_length_description = {
			0: `Fractional Part Length = 0.`,
			1: `Fractional Part Length = 1.`
		}[selected_number[`fractional_part_length`]] ?? `Fractional Part Length > 1.`;

		const test_name = [
			`${selected_number.value_text_state} => ${expected_value_text}`,
			selected_number[`is_negative`]() ? `(Negative.` : `(Positive.`,
			selected_number[`integer_part_length`] === 1 ? `Integer Part Length = 1.` : `Integer Part Length > 1.`,
			fractional_part_length_description,
			selected_number[`decimal_separator`] === `.` ? `Decimal Dot.` : `Decimal Comma.`,
			selected_number.value_text_state.endsWith(`0`) ? `Last Digit = 0.` : ``,
			selected_digit_index ? `Selected Digit Index is ${selected_digit_index}.` : ``
		].filter(Boolean).join(` `) + `)`;

		test(test_name, () => {
			if (selected_digit_index) selected_number[`selected_digit_index`] = selected_digit_index;

			selected_number.move_decimal_separator_left();

			expect(selected_number.value_text_state).toBe(expected_value_text);
			expect(selected_number[`integer_part_length`]).toBe(expected_integer_part_length);
			expect(selected_number[`fractional_part_length`]).toBe(expected_fractional_part_length);
			expect(selected_number[`selected_digit_index`]).toBe(expected_selected_digit_index);
		});
	}
});

describe(`move_decimal_separator_right()`, () => {
	const test_cases: [
		selected_number: SelectedNumber,
		expected_value_text: string,
		expected_integer_part_length: number,
		expected_fractional_part_length: number,
		expected_selected_digit_index: number,
		selected_digit_index?: number,
	][] = [
			[new SelectedNumber(`123.45`, 0), `1234.5`, 4, 1, 1],
			[new SelectedNumber(`-123.45`, 0), `-1234.5`, 4, 1, 1],
			[new SelectedNumber(`123,45`, 0), `1234,5`, 4, 1, 1],
			[new SelectedNumber(`-123,45`, 0), `-1234,5`, 4, 1, 1],

			[new SelectedNumber(`12345`, 0), `123450`, 6, 0, 1],
			[new SelectedNumber(`-12345`, 0), `-123450`, 6, 0, 1],

			[new SelectedNumber(`0.12345`, 0), `1.2345`, 1, 4, 0],
			[new SelectedNumber(`-0.12345`, 0), `-1.2345`, 1, 4, 0],
			[new SelectedNumber(`0,12345`, 0), `1,2345`, 1, 4, 0],
			[new SelectedNumber(`-0,12345`, 0), `-1,2345`, 1, 4, 0],

			[new SelectedNumber(`0.12345`, 0), `1.2345`, 1, 4, 0, -1],
			[new SelectedNumber(`-0.12345`, 0), `-1.2345`, 1, 4, 0, -1],
			[new SelectedNumber(`0,12345`, 0), `1,2345`, 1, 4, 0, -1],
			[new SelectedNumber(`-0,12345`, 0), `-1,2345`, 1, 4, 0, -1],

			[new SelectedNumber(`0.1`, 0), `1`, 1, 0, 0],
			[new SelectedNumber(`-0.1`, 0), `-1`, 1, 0, 0],
			[new SelectedNumber(`0,1`, 0), `1`, 1, 0, 0],
			[new SelectedNumber(`-0,1`, 0), `-1`, 1, 0, 0],
		];

	for (const [selected_number, expected_value_text, expected_integer_part_length, expected_fractional_part_length, expected_selected_digit_index, selected_digit_index] of test_cases) {
		const fractional_part_length_description = {
			0: `Fractional Part Length = 0.`,
			1: `Fractional Part Length = 1.`
		}[selected_number[`fractional_part_length`]] ?? `Fractional Part Length > 1.`;

		const test_name = [
			`${selected_number.value_text_state} => ${expected_value_text}`,
			selected_number[`is_negative`]() ? `(Negative.` : `(Positive.`,
			selected_number[`integer_part_length`] === 1 ? `Integer Part Length = 1.` : `Integer Part Length > 1.`,
			fractional_part_length_description,
			selected_number[`decimal_separator`] === `.` ? `Decimal Dot.` : `Decimal Comma.`,
			/-?0/.test(selected_number.value_text_state) ? `First Digit = 0.` : ``,
			selected_digit_index ? `Selected Digit Index is ${selected_digit_index}.` : ``
		].filter(Boolean).join(` `) + `)`;

		test(test_name, () => {
			if (selected_digit_index) selected_number[`selected_digit_index`] = selected_digit_index;

			selected_number.move_decimal_separator_right();

			expect(selected_number.value_text_state).toBe(expected_value_text);
			expect(selected_number[`integer_part_length`]).toBe(expected_integer_part_length);
			expect(selected_number[`fractional_part_length`]).toBe(expected_fractional_part_length);
			expect(selected_number[`selected_digit_index`]).toBe(expected_selected_digit_index);
		});
	}
});