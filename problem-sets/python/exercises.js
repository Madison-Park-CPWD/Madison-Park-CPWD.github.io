// Exercise data for the Python Practice site, organized into UNITS.
// Each unit: { id, title, exercises: [...] }
// Each exercise: id, title, op (short tag shown in sidebar), description (HTML),
// starter code, and a list of test cases ({stdin, expected}).
// stdin uses \n between separate input() calls.
//
// NOTE ON ORDERING: the order units appear in the dropdown/sidebar is controlled
// by UNIT_ORDER at the very bottom of this file, NOT by the order they're written
// here. To reorder lessons, just edit that one list of ids — you never need to
// move any of the exercise content around.

const UNIT_DATA = [
  {
    id: "int-math",
    title: "Int Math",
    exercises: [
      {
        id: "01",
        title: "Sum of Two Integers",
        op: "+",
        description: `
          <p>Read two integers from input, one per line, and print their <strong>sum</strong>
          using the <code>+</code> operator.</p>
          <pre>&gt; python program.py
3
4
7</pre>
          <p>Use <code>int(input())</code> to read each number, and <code>print()</code> to
          output the result.</p>
        `,
        starter: `# Read two integers, one per line
a = int(input())
b = int(input())

# TODO: print the sum of a and b
`,
        tests: [
          { stdin: "3\n4", expected: "7" },
          { stdin: "10\n15", expected: "25" },
          { stdin: "-5\n8", expected: "3" },
          { stdin: "100\n250", expected: "350" },
          { stdin: "0\n0", expected: "0" },
        ],
      },
      {
        id: "02",
        title: "Difference of Two Integers",
        op: "-",
        description: `
          <p>Read two integers <code>a</code> and <code>b</code>, one per line, and print
          <code>a - b</code> using the <code>-</code> operator.</p>
          <pre>&gt; python program.py
10
4
6</pre>
        `,
        starter: `a = int(input())
b = int(input())

# TODO: print a - b
`,
        tests: [
          { stdin: "10\n4", expected: "6" },
          { stdin: "5\n9", expected: "-4" },
          { stdin: "0\n7", expected: "-7" },
          { stdin: "100\n50", expected: "50" },
          { stdin: "-3\n-8", expected: "5" },
        ],
      },
      {
        id: "03",
        title: "Product of Two Integers",
        op: "*",
        description: `
          <p>Read two integers <code>a</code> and <code>b</code>, one per line, and print
          their product using the <code>*</code> operator.</p>
          <pre>&gt; python program.py
3
4
12</pre>
        `,
        starter: `a = int(input())
b = int(input())

# TODO: print a * b
`,
        tests: [
          { stdin: "3\n4", expected: "12" },
          { stdin: "7\n8", expected: "56" },
          { stdin: "-3\n5", expected: "-15" },
          { stdin: "0\n9", expected: "0" },
          { stdin: "12\n12", expected: "144" },
        ],
      },
      {
        id: "04",
        title: "Power of a Number",
        op: "**",
        description: `
          <p>Read a <code>base</code> and an <code>exponent</code>, one per line, and print
          <code>base ** exponent</code> using Python's exponentiation operator <code>**</code>.</p>
          <pre>&gt; python program.py
2
10
1024</pre>
        `,
        starter: `base = int(input())
exponent = int(input())

# TODO: print base ** exponent
`,
        tests: [
          { stdin: "2\n0", expected: "1" },
          { stdin: "7\n2", expected: "49" },
          { stdin: "2\n10", expected: "1024" },
          { stdin: "3\n4", expected: "81" },
          { stdin: "10\n3", expected: "1000" },
        ],
      },
      {
        id: "05",
        title: "True Division",
        op: "/",
        description: `
          <p>Read two integers <code>a</code> and <code>b</code>, one per line, and print
          <code>a / b</code> using the <code>/</code> operator. In Python 3, <code>/</code>
          always produces a <strong>float</strong>, even when the numbers divide evenly.</p>
          <pre>&gt; python program.py
7
2
3.5</pre>
        `,
        starter: `a = int(input())
b = int(input())

# TODO: print a / b
`,
        tests: [
          { stdin: "7\n2", expected: "3.5" },
          { stdin: "9\n4", expected: "2.25" },
          { stdin: "15\n4", expected: "3.75" },
          { stdin: "8\n2", expected: "4.0" },
          { stdin: "100\n8", expected: "12.5" },
        ],
      },
      {
        id: "06",
        title: "Floor Division",
        op: "//",
        description: `
          <p>Read two integers <code>a</code> and <code>b</code>, one per line, and print
          <code>a // b</code> using the floor division operator <code>//</code>. Floor
          division divides and then rounds <strong>down</strong> to the nearest whole
          number, discarding any remainder.</p>
          <pre>&gt; python program.py
7
2
3</pre>
        `,
        starter: `a = int(input())
b = int(input())

# TODO: print a // b
`,
        tests: [
          { stdin: "7\n2", expected: "3" },
          { stdin: "10\n3", expected: "3" },
          { stdin: "9\n4", expected: "2" },
          { stdin: "23\n5", expected: "4" },
          { stdin: "100\n7", expected: "14" },
        ],
      },
      {
        id: "07",
        title: "Modulo (Remainder)",
        op: "%",
        description: `
          <p>Read two integers <code>a</code> and <code>b</code>, one per line, and print
          <code>a % b</code> using the modulo operator <code>%</code>. The modulo operator
          returns the <strong>remainder</strong> left over after division.</p>
          <pre>&gt; python program.py
7
2
1</pre>
        `,
        starter: `a = int(input())
b = int(input())

# TODO: print a % b
`,
        tests: [
          { stdin: "7\n2", expected: "1" },
          { stdin: "10\n3", expected: "1" },
          { stdin: "9\n4", expected: "1" },
          { stdin: "23\n5", expected: "3" },
          { stdin: "100\n7", expected: "2" },
        ],
      },
      {
        id: "08",
        title: "Order of Operations",
        op: "+ *",
        description: `
          <p>Read three integers <code>a</code>, <code>b</code>, and <code>c</code>, one per
          line, and print the result of:</p>
          <pre>a + b * c</pre>
          <p>Python follows standard order of operations (PEMDAS), so multiplication happens
          <strong>before</strong> addition even though <code>+</code> appears first.</p>
          <pre>&gt; python program.py
2
3
4
14</pre>
          <p>(<code>3 * 4</code> is calculated first to get <code>12</code>, then
          <code>2 + 12 = 14</code>.)</p>
        `,
        starter: `a = int(input())
b = int(input())
c = int(input())

# TODO: print a + b * c
`,
        tests: [
          { stdin: "2\n3\n4", expected: "14" },
          { stdin: "5\n0\n10", expected: "5" },
          { stdin: "1\n1\n1", expected: "2" },
          { stdin: "10\n2\n3", expected: "16" },
          { stdin: "0\n5\n5", expected: "25" },
        ],
      },
      {
        id: "09",
        title: "Even or Odd",
        op: "%",
        description: `
          <p>Read one integer <code>n</code> and print <code>Even</code> if it is evenly
          divisible by 2, or <code>Odd</code> otherwise. Use the modulo operator
          <code>%</code> to check the remainder when dividing by 2.</p>
          <pre>&gt; python program.py
4
Even</pre>
          <p><strong>Hint:</strong> <code>n % 2</code> is <code>0</code> for even numbers.</p>
        `,
        starter: `n = int(input())

# TODO: if n % 2 == 0, print "Even", otherwise print "Odd"
`,
        tests: [
          { stdin: "4", expected: "Even" },
          { stdin: "7", expected: "Odd" },
          { stdin: "0", expected: "Even" },
          { stdin: "-3", expected: "Odd" },
          { stdin: "100", expected: "Even" },
        ],
      },
      {
        id: "10",
        title: "Seconds to Minutes:Seconds",
        op: "// %",
        description: `
          <p>Read one integer representing a total number of seconds, and print it in
          <code>M:SS</code> format, where minutes and leftover seconds are separated by a
          colon. Leftover seconds should always show two digits (use <code>:02d</code> in an
          f-string).</p>
          <p>Use <code>//</code> to find whole minutes and <code>%</code> to find leftover
          seconds.</p>
          <pre>&gt; python program.py
125
2:05</pre>
          <p>(125 seconds is 2 minutes and 5 leftover seconds.)</p>
        `,
        starter: `total_seconds = int(input())
minutes = total_seconds // 60
seconds = total_seconds % 60

# TODO: print in "M:SS" format, e.g. f"{minutes}:{seconds:02d}"
`,
        tests: [
          { stdin: "125", expected: "2:05" },
          { stdin: "59", expected: "0:59" },
          { stdin: "60", expected: "1:00" },
          { stdin: "3661", expected: "61:01" },
          { stdin: "600", expected: "10:00" },
        ],
      },
    ],
  },

  {
    id: "print-input-fstrings",
    title: "Print, Input & f-strings",
    exercises: [
      {
        id: "01",
        title: "Hello, World",
        op: "print",
        description: `
          <p>Use <code>print()</code> to output exactly the following, with no input
          needed:</p>
          <pre>Hello, World!</pre>
          <p>Make sure your spelling, capitalization, and punctuation match exactly.</p>
        `,
        starter: `# TODO: print exactly Hello, World!
`,
        tests: [{ stdin: "", expected: "Hello, World!" }],
      },
      {
        id: "02",
        title: "Print Two Values",
        op: "print(a, b)",
        description: `
          <p>Read two words, one per line, and print them <strong>on the same line,
          separated by a single space</strong>. You can hand multiple values to
          <code>print()</code> separated by commas, and it will space them out for you
          automatically.</p>
          <pre>&gt; python program.py
cat
dog
cat dog</pre>
        `,
        starter: `a = input()
b = input()

# TODO: print a and b on the same line, separated by a space
# hint: print(a, b) does this automatically
`,
        tests: [
          { stdin: "cat\ndog", expected: "cat dog" },
          { stdin: "red\nblue", expected: "red blue" },
          { stdin: "up\ndown", expected: "up down" },
        ],
      },
      {
        id: "03",
        title: "Custom Separator",
        op: "sep=",
        description: `
          <p>Read two words, one per line, and print them on the same line separated by a
          <strong>dash</strong> instead of a space. The <code>print()</code> function
          accepts a <code>sep</code> keyword argument that controls what goes between
          values.</p>
          <pre>&gt; python program.py
cat
dog
cat-dog</pre>
        `,
        starter: `a = input()
b = input()

# TODO: print a and b separated by a dash
# hint: print(a, b, sep="-")
`,
        tests: [
          { stdin: "cat\ndog", expected: "cat-dog" },
          { stdin: "red\nblue", expected: "red-blue" },
          { stdin: "2024\n07", expected: "2024-07" },
        ],
      },
      {
        id: "04",
        title: "Print Without a Newline",
        op: "end=",
        description: `
          <p>Read two words, one per line. Print the first word so that <strong>no
          newline</strong> is added after it, then print the second word normally — so
          both end up on the same line, separated by a space.</p>
          <p><code>print()</code> normally adds a newline at the end automatically. The
          <code>end</code> keyword argument controls what gets added instead — set it to
          a single space to keep the next <code>print()</code> on the same line.</p>
          <pre>&gt; python program.py
cat
dog
cat dog</pre>
        `,
        starter: `a = input()
b = input()

# TODO: print a first with end=" " (no newline), then print b normally
# hint: print(a, end=" ")
`,
        tests: [
          { stdin: "cat\ndog", expected: "cat dog" },
          { stdin: "red\nblue", expected: "red blue" },
          { stdin: "up\ndown", expected: "up down" },
        ],
      },
      {
        id: "05",
        title: "Echo Input Exactly",
        op: "input",
        description: `
          <p>Read one full line of text (it may contain spaces) and print it back out,
          <strong>unchanged</strong>.</p>
          <pre>&gt; python program.py
I love Python
I love Python</pre>
        `,
        starter: `message = input()

# TODO: print message back out, unchanged
`,
        tests: [
          { stdin: "I love Python", expected: "I love Python" },
          { stdin: "Boston Public Schools", expected: "Boston Public Schools" },
          { stdin: "42 is my number", expected: "42 is my number" },
        ],
      },
      {
        id: "06",
        title: "Add a Greeting",
        op: "+",
        description: `
          <p>Read a name, then print a greeting by <strong>joining strings together</strong>
          with the <code>+</code> operator.</p>
          <pre>&gt; python program.py
Ava
Hello, Ava!</pre>
          <p><strong>Hint:</strong> you can join strings with <code>+</code>, e.g.
          <code>"Hello, " + name + "!"</code>.</p>
        `,
        starter: `name = input()

# TODO: print "Hello, " followed by name followed by "!"
# hint: "Hello, " + name + "!"
`,
        tests: [
          { stdin: "Ava", expected: "Hello, Ava!" },
          { stdin: "Marcus", expected: "Hello, Marcus!" },
          { stdin: "Priya", expected: "Hello, Priya!" },
        ],
      },
      {
        id: "07",
        title: "Greet with an f-string",
        op: 'f"{}"',
        description: `
          <p>Same result as the last exercise, but this time use an
          <strong>f-string</strong> instead of <code>+</code>. An f-string lets you drop a
          variable directly inside a string using curly braces:</p>
          <pre>f"Hello, {name}!"</pre>
          <p>Notice the <code>f</code> right before the opening quote — that's what makes
          it an f-string. Without it, Python would print the curly braces literally.</p>
          <pre>&gt; python program.py
Ava
Hello, Ava!</pre>
        `,
        starter: `name = input()

# TODO: print an f-string greeting: f"Hello, {name}!"
`,
        tests: [
          { stdin: "Ava", expected: "Hello, Ava!" },
          { stdin: "Marcus", expected: "Hello, Marcus!" },
          { stdin: "Priya", expected: "Hello, Priya!" },
        ],
      },
      {
        id: "08",
        title: "Introduce Yourself",
        op: 'f"{}"',
        description: `
          <p>Read a name and an age (as a whole number), and print a full introduction
          using <strong>one f-string with two variables</strong> inside it.</p>
          <pre>&gt; python program.py
Ava
16
My name is Ava and I am 16 years old.</pre>
        `,
        starter: `name = input()
age = int(input())

# TODO: print an f-string:
# My name is <name> and I am <age> years old.
`,
        tests: [
          { stdin: "Ava\n16", expected: "My name is Ava and I am 16 years old." },
          { stdin: "Marcus\n17", expected: "My name is Marcus and I am 17 years old." },
          { stdin: "Priya\n15", expected: "My name is Priya and I am 15 years old." },
        ],
      },
      {
        id: "09",
        title: "Math Inside an f-string",
        op: 'f"{a+b}"',
        description: `
          <p>Read two integers and print an f-string that shows the whole equation,
          <strong>including the answer</strong> — all computed inside the curly braces.</p>
          <pre>&gt; python program.py
2
3
2 + 3 = 5</pre>
          <p>You can put any expression inside <code>{ }</code> in an f-string, including
          math — Python evaluates it and drops the result right into the string.</p>
        `,
        starter: `a = int(input())
b = int(input())

# TODO: print an f-string like: {a} + {b} = {a + b}
`,
        tests: [
          { stdin: "2\n3", expected: "2 + 3 = 5" },
          { stdin: "10\n15", expected: "10 + 15 = 25" },
          { stdin: "7\n8", expected: "7 + 8 = 15" },
        ],
      },
      {
        id: "10",
        title: "Fix the Bug",
        op: "debug",
        description: `
          <p>This code is <em>supposed</em> to print a greeting like
          <code>Hello, Ava!</code>, but it has a bug — run it and see what it actually
          prints. Find the missing piece and fix it.</p>
          <p><strong>Hint:</strong> what turns a regular string into an f-string?</p>
        `,
        starter: `name = input()
print("Hello, {name}!")
`,
        tests: [
          { stdin: "Ava", expected: "Hello, Ava!" },
          { stdin: "Marcus", expected: "Hello, Marcus!" },
          { stdin: "Priya", expected: "Hello, Priya!" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// LESSON ORDER — edit this list to reorder units. Just move ids up or down;
// nothing else in this file needs to change. Any unit id from UNIT_DATA above
// that's left out of this list simply won't show up on the site (handy for
// drafting a unit before it's ready to assign).
// ---------------------------------------------------------------------------
const UNIT_ORDER = [
  "print-input-fstrings", // moved first: int-math already assumes input()/print()
  "int-math",
];

// Builds the final ordered list the app actually uses — don't edit below this line.
const UNITS = UNIT_ORDER.map(id => UNIT_DATA.find(u => u.id === id)).filter(Boolean);
