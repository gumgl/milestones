export const Generator =
{
  map: (f,gf) => function* (...args)
    {
      for (const x of gf (...args))
        yield f (x)
    },
  filter: (f,gf) => function* (...args)
    {
      for (const x of gf (...args))
        if (f (x))
          yield x
    },
  take: function(n, gi) {
    let list=[];
    for (let i=0, c=gi.next();
      !c.done && i<n;
      i++, c=gi.next())
      list[i] = c.value;
    return list;
  },
  takeWhile: function(f, gi) {
    let list = [];
    for (let c=gi.next();
      !c.done && f(c.value);
      c=gi.next())
      list.push(c.value);
    return list;
  }
};

export const Generators = [
  {
    name:"powers10",
    gf: function*() {
      for (let n = 1; ; n++)
        yield {
          params: [n],
          value: Math.pow(10,n)
        };
    },
    format: (item) => item.value.toLocaleString(),//"10^" + item.params[0]
    oeis: "A011557"
  },
  {
    name:"powers2",
    gf: function*() {
      for (let n = 1; ; n++)
        yield {
          params: [n],
          value: Math.pow(2,n)
        };
    },
    format: (item) => "2^" + item.params[0],
    oeis: "A000079"
  },
  {
    name:"repdigit",
    gf: function*() {
      for (let b=1; ; b=b*10+1)
        for (let n=1; n<=9; n++)
          yield {
            params: [b, n],
            value: b*n
          };
    },
    format: (item) => item.value.toLocaleString(),
    oeis: "A010785"
  },
  {
    name:"n10x",
    gf: function*() {
      for (let x=1; ; x++)
        for (let n=2; n<=9; n++)
          yield {
            params: [n, x],
            value: n * Math.pow(10, x)
          };
    },
    format: (item) => item.value.toLocaleString(),
    oeis: "A037124"
  },
  {
    name:"factorial",
    gf: function*() {
      for (let n = 1, m = 1; ; n++, m *= n)
        yield {
          params: [n],
          value: m
        };
    },
    format: (item) => item.params[0] + "!",
    oeis: "A005150"
  },
  {
    name:"lookandsay",
    gf: function*() {
      let nextTerm = (term) => {
        let result = "";
        for (let i=0, c=0, prev; i < term.length; i++) {
          if (c == 0 || term[i] != prev ) {
            if (c != 0)
              result += "" + c + prev;
            prev = term[i];
            c = 1;
          } else
            c++;
          if (i == term.length - 1)
            result += "" + c + prev;
        }
        return result;
      };
      for (let term = "1"; ; term = nextTerm(term))
        yield {
          params: [term],
          value: term
        };
    },
    format: (item) => item.value,
    oeis: "A005150"
  },
];