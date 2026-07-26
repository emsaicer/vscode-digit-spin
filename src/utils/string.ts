declare global {
	interface String {
		remove_at(index: number): string;
		insert_at(new_string: string, index: number): string;
		replace_at(replacement_string: string, index: number): string;
		move_to(from_index: number, to_index: number): string;
	}
}

if (!String.prototype.remove_at) {
	String.prototype.remove_at = function (index: number): string {
		return this.slice(0, index) + this.slice(index + 1);
	};
}

if (!String.prototype.insert_at) {
	String.prototype.insert_at = function (new_string: string, index: number): string {
		return this.slice(0, index) + new_string + this.slice(index);
	};
}

if (!String.prototype.replace_at) {
	String.prototype.replace_at = function (replacement_string: string, index: number): string {
		return this.slice(0, index) + replacement_string + this.slice(index + 1);
	};
}

if (!String.prototype.move_to) {
	String.prototype.move_to = function (from_index: number, to_index: number): string {
		const new_string = this.slice(0, from_index) + this.slice(from_index + 1);

		return new_string.slice(0, to_index) + this[from_index] + new_string.slice(to_index);
	};
}

export { };