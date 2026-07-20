# Digit Spin Extension for VS Code

`Digit Spin` adds an ability to **change numbers digit by digit** with **arrow keys**, thus making it easier and more controllable to work with numbers.

## Select – Change – Deselect

- Put the **cursor on the number** you want to work with and use the `Ctrl` **+** `Shift` **+** `Q` shortcut to **select** it.
- Press the `Right` and `Left` arrow keys to **select the digit** you want to change.
- Use the `Up` and `Down` arrow keys to **increment** and **decrement** the selected digit.
- To **deselect** the number you can do one of the following actions:
  - Press `Escape`.
  - Press `Enter`.
  - Press `Ctrl` **+** `Shift` **+** `Q`.
  - Click somewhere inside the document with a **mouse**.

![Select – Change – Deselect GIF](https://github.com/emsaicer/vscode-digit-spin/blob/main/images/gif/select-change-deselect.gif?raw=true)

## Carry and Borrow

Digits are not changed in isolation. `Carry` and `borrow` rules are applied. If you select number `19` and **increase its first digit**, it becomes `20`. Similar logic works for subtraction.

![Carry and Borrow GIF](https://github.com/emsaicer/vscode-digit-spin/blob/main/images/gif/carry-and-borrow.gif?raw=true)

## Add New Digits

If you go **beyond** the number's highest or lowest digit, a **new digit** with value 0 will be created, which you can change as well.

![Add New Digits GIF](https://github.com/emsaicer/vscode-digit-spin/blob/main/images/gif/add-new-digits.gif?raw=true)

## Work with Several Numbers

It is possible to **select more than one number** using the [multi-cursor VS Code feature](https://code.visualstudio.com/docs/editing/codebasics#_multiple-selections-multi-cursor) and work with all of them at the same time.

![Work with Several Numbers GIF](https://github.com/emsaicer/vscode-digit-spin/blob/main/images/gif/work-with-several-numbers.gif?raw=true)

## Incremental Change

Use `Ctrl` **+** `Up` and `Ctrl` **+** `Down` shortcuts to increase and decrease the numbers **incrementally**, i.e, each subsequent number will change **by one more** than the previous one.

![Incremental Change GIF](https://github.com/emsaicer/vscode-digit-spin/blob/main/images/gif/incremental-change.gif?raw=true)

## Select Adjacent Number

When a number is selected, you can **select the left or right number** using the `Ctrl` **+** `Left` and `Ctrl` **+** `Right` hotkey respectively.

![Select Adjacent Numbers GIF](https://github.com/emsaicer/vscode-digit-spin/blob/main/images/gif/select-adjacent-number.gif?raw=true)

## Other Features

- Support of numbers with **fractional parts** with both **decimal** and **comma** points.
- Support of **negative numbers**.
- Ability to select the **highest** and **lowest** digit with the `Home` (`Fn` **+** `Left`) and `End` (`Fn` **+** `Right`) keybindings, respectively.
- Ability to **delete a selected digit** using `Backspace`.
- Ability to deselect a number and **delete all insignificant zeros** with `Ctrl` **+** `Enter`.

## Useful Links

[Digit Spin page on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=emsaicer.digit-spin)