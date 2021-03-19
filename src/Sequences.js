export const Generator =
{
  map: (f, gf) => function* (...args) {
    for (const x of gf(...args))
      yield f(x)
  },
  filter: (f, gf) => function* (...args) {
    for (const x of gf(...args))
      if (f(x))
        yield x
  },
  take: function (n, gi) {
    let list = [];
    for (let i = 0, c = gi.next();
      !c.done && i < n;
      i++, c = gi.next())
      list[i] = c.value;
    return list;
  },
  takeWhile: function (f, gi) {
    let list = [];
    for (let c = gi.next();
      !c.done && f(c.value);
      c = gi.next())
      list.push(c.value);
    return list;
  },
  nth: function (n) {
    return [, 'st', 'nd', 'rd'][n / 10 % 10 ^ 1 && n % 10] || 'th'
  } // credit to https://stackoverflow.com/a/39466341/646562
};

export const Sequences = [
  {
    id: "powers10",
    name: "10^n",
    friendlyName: "10, 100, 1000, 10000, ...",
    oeis: "A011557",
    gf: function* () {
      for (let n = 1; ; n++)
        yield { value: Math.pow(10, n), n: n };
    },
    display: (item) => item.value.toLocaleString(),//"10^" + item.params[0]
    explain: (item) => "The first (decimal) number with " + (item.n + 1) + " digits",
  },
  {
    id: "powers2",
    name: "2^n",
    friendlyName: "2, 256, 4096, ... (powers of 2)",
    oeis: "A000079",
    gf: function* () {
      for (let n = 1; ; n++)
        yield { value: Math.pow(2, n), n: n };
    },
    display: (item) => "2^" + item.n,
    explain: (item) => "2^" + item.n + " = " + item.value,
  },
  {
    id: "repdigit",
    name: "[a]^n (repeated digits)",
    friendlyName: "11111, 222, 5555, ... (repeated digits)",
    oeis: "A010785",
    gf: function* () {
      for (let n = 1, base = 1; ; base = base * 10 + 1, n++)
        for (let a = 1; a <= 9; a++)
          yield { value: base * a, a: a, n: n };
    },
    display: (item) => item.value.toLocaleString(),
    explain: (item) => item.a + " repeated " + item.n + " times",
  },
  {
    id: "n10x",
    name: "a * 10^n (for small a)",
    friendlyName: "2000, 30000, 800 ... (many zeroes)",
    oeis: "A037124",
    gf: function* () {
      for (let n = 1; ; n++)
        for (let a = 2; a <= 9; a++)
          yield {
            value: a * Math.pow(10, n),
            a: a,
            n: n,
          };
    },
    display: (item) => item.value.toLocaleString(),
    explain: (item) => item.a + " followed by " + item.n + " zeroes",
  },
  {
    id: "factorial",
    name: "n! (factorial)",
    friendlyName: "4!, 5!, 9!, .. (factorials)",
    oeis: "A005150",
    gf: function* () {
      for (let n = 1, m = 1; ; n++, m *= n)
        yield { value: m, n: n };
    },
    display: (item) => item.n + "!",
    explain: (item) => item.n + "*" + (item.n - 1) + "*...*2*1 = " + item.value.toLocaleString()
  },
  {
    id: "lookandsay",
    name: "Look-and-say terms",
    friendlyName: "Look-and-say sequence",
    oeis: "A005150",
    gf: function* () {
      let nextTerm = (term) => {
        let result = "";
        for (let i = 0, c = 0, prev; i < term.length; i++) {
          if (c === 0 || term[i] !== prev) {
            if (c !== 0)
              result += "" + c + prev;
            prev = term[i];
            c = 1;
          } else
            c++;
          if (i === term.length - 1)
            result += "" + c + prev;
        }
        return result;
      };
      for (let term = "1"; ; term = nextTerm(term))
        yield { value: term };
    },
    display: (item) => item.value,
    explain: (item) => "See OEIS page of the look-and-say sequence :)"
  },
  {
    id: "fib",
    name: "Fibonacci numbers",
    friendlyName: "1, 1, 2, 3, 5, 8, ... (Fibonacci)",
    oeis: "A000045",
    gf: function* () {
      yield { value: 0, params: [] };
      yield { value: 1, params: [] };
      for (let a = 0, b = 1, n = 1; ; b = a + b, a = b - a, n++)
        yield { value: a + b, n: n };
    },
    display: (item) => "F_" + item.n,
    explain: (item) => item.n + Generator.nth(item.n) + " Fibonacci number = " + item.value.toLocaleString()
  },
  {
    id: "1ton",
    name: "[1..n] for n-digit numbers",
    friendlyName: "12, 123, 1234, ...",
    oeis: "A007908",
    gf: function* () {
      for (let n = 1, term = "1"; ; n++, term += n)
        yield { value: Number(term), n: n };
    },
    display: (item) => item.value.toLocaleString(),
    explain: (item) => "All the digits from 1 up to " + item.n
  },
  {
    id: "nto1",
    name: "[n..1] for n-digit numbers",
    friendlyName: "21, 321, 4321, ...",
    oeis: "A000422",
    gf: function* () {
      for (let n = 1, term = "1"; ; n++, term = n + term)
        yield { value: Number(term), n: n };
    },
    display: (item) => item.value.toLocaleString(),
    explain: (item) => "All the digits from " + item.n + " down to 1"
  },
];