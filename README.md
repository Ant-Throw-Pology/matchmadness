# matchmadness

A small program that plays Match Madness.

**To use:**

Clone the repository, then install dependencies and run `index.ts` with [Bun](https://bun.sh/).

```bash
bun install

bun index.ts
```

Then, enter your puzzle. Enter for new line, Space for a blank space, arrows to move around if you made a mistake, and these keys for the tiles: x, o, +, #, *. Focused tiles have bold text or a grey background.

Otherwise, you can specify the rows in argv. Other characters than x, o, +, #, and * (case-insensitive) will be converted to spaces.

```bash
bun index.ts '-oo' '++++' '#x*#'
```
...solves...
```
 oo
++++
#x*#
```

Don't count on Node support.