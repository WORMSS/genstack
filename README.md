# @wormss/genstack

Because I like `Iterators` and `Generators`, and I'm lazy
I think the technique is also called Lazy Evaluation.
I would recommend people use Streamjs or it's successor Sequency as more 'complete' packages,
I mostly concentrated on modifying iterators than generating or terminating them
and everything is chainable.

GenStack and AsyncGenStack are themselves iterable and iterators, to give the most interoperability with other packages and libraries.

```bash
npm i @wormss/genstack
```

## Example

```js
const gen = AsyncGenStack.range({ start: 1 })
  .map((pageNumber) => fetch(`api/results/${pageNumber}`)) // call your paginated api
  .runWhile((response) => response.ok) // quit if the response has an error code
  .map((response) => response.json()) // download the body as json
  .runUntil((body) => body.results.length === 0) // quit if the results are zero
  .flatMap((body) => body.results) // turn array of results into individual results
  .filter((value) => value.id === '') // throw some results away, because why not
  .distinctBy((value) => value.date) // only take the first value per unique date
  .merge([fakeItem]); // merge in more items at the end

for await (const message of gen) {
  console.log(message.id, message.date, message.text);
}
```

## API

- Static
  - [GenStack.from(input)](#genstackfrominput)
  - [GenStack.generator(func)](#genstackgeneratorfunc)
  - [GenStack.range(options)](#genstackrangeoptions)
  - [GenStack.merge(...inputs)](#genstackmergeinputs)
  - [GenStack.interlace(...inputs)](#genstackinterlaceinputs)
  - [GenStack.walker(node, children)](#genstackwalkernode-children)
  - [GenStack.reg(reg, content)](#genstackregreg-content)
- Limit (chainable)
  - [.limit(num)](#limitnum)
  - [.runWhile(cb)](#runwhilecb)
  - [.runUntil(cb)](#rununtilcb)
- Filtering (chainable)
  - [.filter(cb)](#filtercb)
  - [.filterUndefined()](#filterundefined)
  - [.filterNull()](#filternull)
  - [.filterNullUndefined()](#filternullundefined)
  - [.distinct](#distinct)
  - [.distinctBy(cb)](#distinctbycb)
  - [.skip(num)](#skipnum)
  - [.skipWhile(cb)](#skipwhilecb)
  - [.skipUntil(cb)](#skipuntilcb)
- Mapping (chainable)
  - [.map(cb)](#mapcb)
  - [.mapAsync(cb)](#mapasynccb)
- Expand (chainable)
  - [.flatMap(cb)](#flatmapcb)
  - [.flatMapAsync(cb)](#flatmapasynccb)
  - [.walker(children)](#walkerchildren)
- Merge (chainable)
  - [.merge(...inputs)](#mergeinputs)
  - [.interlace(...inputs)](#interlaceinputs)
- Utility (chainable)
  - [.peek(cb)](#peekcb)
- Terminators (insert Skynet joke)
  - [.toArray()](#toarray)

#### GenStack.from(input)

Simplist way to make a GenStack from anything that is an Iterator or Iterable. `Arrays, Maps, Sets, Strings, Generators` are all forms of iterables.

If you have async generator or async iterator, you will need to use AsyncGenStack, but the API is identical

On a happier note, if you pass a synchronous generator or synchronous iterator to AsyncGenStack, it will internally wrap

```ts
const { GenStack, AsyncGenStack } = require('@wormss/genstack');

const gen = GenStack.from([1, 2, 3, 4, 5, 6]); // Sync GenStack from Array
const gen = GenStack.from('Hello'); // Sync GenStack, will result in each letter being split, since string is an iterable
const gen = GenStack.from(myGenerator()); // Sync GenStack from async Generator or async iterator
const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6]); // Async GenStack from synchrous Array
const gen = AsyncGenStack.from('Hello'); // Async Generator will result in each letter being split, since string is an iterable, but asynchronously
const gen = AsyncGenStack.from(myAsyncGenerator()); // Async GenStack from async Generator or async iterator
const gen = AsyncGenStack.from(GenStack.from([1, 2, 3])); // Because why not.
```

#### GenStack.generator(func)

Infinitly call a supplied function for values.

```ts
const gen = GenStack.generate(Math.random);
const gen = AsyncGenStack.generate(() => fetch('https://something.com/randomStuff'));
```

### GenStack.range(options)

Standard Number range, start/end/step can all be configured

Start is optional, inclusive. The default is zero.\
End is optional, exclusive. There is no default, it is effectively Infinity or -Infinity depending on step\
Step is optional. The default is one.

This will produce `0, 2, 4, 6, 8, 10, 12, 14, 16, 18`

```ts
const options = {
  start: 0,
  end: 20,
  step: 2,
};
const gen = GenStack.range(options);
const gen = AsyncGenStack.range(options);
```

These are effectively the same. Start at zero and increases by 1 forever

```ts
const gen = GenStack.range();
const gen = AsyncGenStack.range();
const gen = GenStack.range({});
const gen = AsyncGenStack.range({});
```

### GenStack.merge(...inputs)

**_// TODO add more info_**

Merge (or concatinate) multiple iterators or iterables together

```ts
// 0...many number of iterable_or_iterators
GenStack.merge(iterable1, iterable2, ...iterables);
```

### GenStack.interlace(...inputs)

**_// TODO add more info_**

Interlace multiple iterators or iterables together. Taking 1 from each at a time

```ts
// 0...many number of iterable_or_iterators
GenStack.interlace(iterable1, iterable2, ...iterables);
```

### GenStack.walker(node, children)

**_// TODO add more info_**

```ts
GenStack.walker({ children: [] }, (n) => n.children);
```

### GenStack.reg(reg, content)

**_// TODO add more info_**

```ts
GenStack.reg('a.', 'aaabacad');
```

### .limit(num)

**_// TODO add more info_**

```ts
// only run until x number of values before stopping
GenStack.from(myList).limit(num);
```

### .runWhile(cb)

**_// TODO add more info_**

```ts
// lets everything through until cb returns false.
GenStack.from(myList).runWhile(cb);
```

### .runUntil(cb)

**_// TODO add more info_**

```ts
// lets everything through until cb returns true
GenStack.from(myList).runUntil(cb);
```

### .filter(cb)

**_// TODO add more info_**

```ts
// throw away the values when cb returns false
GenStack.from(myList).filter(cb);
```

### .distinct

**_// TODO add more info_**

```ts
// throw away values when they strictly match previous values
GenStack.from(myList).distinct();
```

### .distinctBy(cb)

**_// TODO add more info_**

```ts
// throw away values when cb returned values match previous cb values.
GenStack.from(myList).distinctBy(cb);
```

### .skip(num)

**_// TODO add more info_**

```ts
// throw away the first x number of values
GenStack.from(myList).skip(num);
```

### .skipWhile(cb)

**_// TODO add more info_**

```ts
// skips all values until cb returns false, then lets everything else through
GenStack.from(myList).skipWhile(cb);
```

### .skipUntil(cb)

**_// TODO add more info_**

```ts
// skips all values until cb returns true, then lets everything else through
GenStack.from(myList).skipUntil(cb);
```

### .map(cb)

**_// TODO add more info_**

```ts
// change value into another value
GenStack.from(myList).map(cb);\
```

### .mapAsync(cb)

**_// TODO add more info_**

```ts
// use the value to do some asynchrous call. Remember this is nice lazy evaluation, so will only run 1 at a time
GenStack.from(myList).mapAsync(cb);
```

#### .flatmap(cb)

```ts
// flatterns a list of lists into a single list. By list, I mean anythign that is iterable or an iterator. Be mindful of strings
GenStack.from(myList).flatMap(cb);

// flatterns into a single list after making an async call
GenStack.from(myList).flatMapAsync(cb);

// map and mapAsync are the same function on AsyncGenStack
// flatMap and flatMapAsync are the same function on AsyngGenStack
```

### Merging

#### .merge(...inputs)

```ts
// See GenStack.merge, only difference is they are concatinated after the 'this' has ran out of values
GenStack.from(myList).merge(iterable2, ...iterables);
```

#### .interlace(...inputs)

```ts
// See GenStack.interlace, only difference is 'this' is the first iterator to interlace
GenStack.from(myList).interlace(iterable2, ...iterables);
```

### Utilities

#### .peek(cb)

```ts
// cb will be called with the value, but the value itself will continue down the stack.
GenStack.from(myList).peek(cb);
```

### Terminators (insert Skynet joke)

#### .toArray()

I've listed both here.... Just because, you know.. reasons..

```ts
// because I found out there is no simple way of spreading an asynchrous iterator into an array. And I am too lazy to write the same logic everywhere.
await AsyncStack.from(myList).toArray();

// nothing more than a spread operator. You can be lazy and call .toArray or do [...gen] Only here to match the Async's function
GenStack.from(myList).toArray();
```

## Usage Examples

There are two main exports GenStack and AsyncGenStack classes
No points are given for guessing when to use which over the other
Though, `AsyncGenStack.from()` will gladly accept any sync `Iterator | Iterable` and wrap it to be async

```ts
const { GenStack } = require('@wormss/genstack');

const gen = new GenStack(someUnlimitedIterator)
  .filter((someItem) => someItem.someProperty === 'someValue') // filter to only get some values
  .limit(100) // take the first 100
  .map((someItem) => someItem.someDifferentValue * 2); // map those items into a different form

// At this point, you can do anything you would normally do with any iterator.
const array1 = [1, 2, 3, ...gen]; // put all the items in an array with spread
for (const value of gen) {
  // receive the values in a for...of loop
}
// or choose one of the super lazy terminator
const array2 = gen.toArray();
```

The contructor is limited to iterators (purely for limiting complexity) there is `GenStack.from()` for greater compatibility

### Iterables

```ts
// Split a string into individual letters
const gen1 = GenStack.from('string'); // values will be "s", "t", "r", "i", "n", "g"

// An array
const gen2 = GenStack.from(['string', 'another string']); // values will be "string", "another string"

// Set
const mySet = new Set();
mySet.add(1);
mySet.add(2);
mySet.add(3);
const gen3 = GenStack.from(mySet); // values will be 1, 2, 3

// Map
const myMap = new Map();
myMap.set('a', 1);
myMap.set('b', 2);
myMap.set('c', 3);
const gen4 = GenStack.from(myMap); // values will be an ['a', 1], ['b', 2] ,['c', 3]

// Custom iterable
let i = 0;
const myIterable = {
  [Symbol.iterator]() {
    return { next() { return { value: this.i++; done: false } }, };
  },
};
const gen5 = GenStack.from(myIterable); // values will be 0, 1, 2, 3, 4.....Infinity
```

### Iterator

You will guess from the code below, it's easier to deal with iterables, but just incase you have an iterator

```ts
// Get an iterator
const array = ['a', 'b', 'c'];
const iterator = array[Symbol.iterator]();
const gen6 = GenStack.from(iterator); // values will be 'a', 'b', 'c'

// Since you have the iterator directly, you can use the constructure if you really wanted
const array = [1, 2, 3];
const iterator = array[Symbol.iterator]();
const gen7 = new GenStack(iterator); // values will be 1, 2, 3 (as long as gen6 hasn't run)

// Make your own iterator
let i = 0;
const iterator = { next() { return { i++; done: false }; } };
const gen8 = new GenStack(iterator);
// or
const gen9 = GenStack.from(iterator);
```

### Built in Generators

Range, go from start

```ts
// Blank, from 0 to infinity and beyond.
const gen10 = GenStack.range(); // values will be 0, 1, 2, 3....Infinate

// Start, end, step supplied to truely customise
const gen11 = GenStack.range({
  start: 10, // default 0
  end: 20, // end is exclusive, default undefined, eg, Infinite
  step: 3, // default 1 or -1 depending on start and end values
}); // values will be 10, 13, 16, 19

// And don't try to outsmart it, it knows..
const gen12 = GenStack.range({
  start: 10,
  end: 21,
  step: -5, // it wont try to step downwards if start/end are ascending
}); // values will be 10, 15, 20

// decend to the very bottom
const gen13 = GenStack.range({
  start: 4
  step: -2, // not supplying an end, is the only time negative step will do anything backwards
}); // values will be 4, 2, 0, -2, -4...-Infinity
```
