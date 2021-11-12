# PH ACK

Ph! Ack! (written as ph-ack, PhAck, PH ACK, or any other way which highlights the break between ph and ack) is a really small package to debug process memory via Node.js.

## Installation

Just install it like any package, like

```sh
npm i ph-ack
```

or

```sh
yarn install ph-ack
```

Typescript declarations are bundled.

## Usage

There is one exported function which should be really used: `createPhAck` (takes 1 parameter - the PID (as a number)), which returns an instance of the `PhAck` class.

### Example

```ts
import { createPhAck } from "ph-ack"
const pa = await createPhAck(12345)
pa.freeze()
// Replace 12 with 24 at address 0x12345
if ((await pa.peekUint8(0x12345)) === 12) await pa.pokeUint8(0x12345, 24)

// Check if the int32 at address 0x678ab is endian-symmetric
if ((await pa.peekInt32(0x678ab)) === (await pa.peekInt32(0x678ab, true)))
	console.log("The value is bit-symmetric!")

pa.unfreeze()
```

## Documentation

### `createPhAck`

Parameters:

- `pid` (`number`) - The PID of the process to hack

Returns an instance of the `PhAck` class.

### `PhAck`

#### Methods

|                                      Method name                                      |                                                                                                                                   Parameters                                                                                                                                   |                                         Usage                                         |
| :-----------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| `peekUint8`<br>`peekUint16`<br>`peekUint32`<br>`peekUint64`<br>and `int` alternatives |                               - `address` (`number`) - The address of the number to see<br>- `bigEndian` (`boolean`) - If to read the number in the Big Endian order or not<br>Returns `Promise<number>` (`Promise<bigint>` for 64-bit numbers)                                |                      Reads a number from the specified address.                       |
| `pokeUint8`<br>`pokeUint16`<br>`pokeUint32`<br>`pokeUint64`<br>and `int` alternatives | - `address` (`number`) - The address of the number to write to<br>- `val` (`number` (`bigint` for 64-bit numbers)) - The number to write to the process memory<br>- `bigEndian` (`boolean`) - If to write the number in the Big Endian order or not<br>Returns `Promise<void>` |                       Writes a number to the specified address.                       |
|                                `freeze`<br>`unfreeze`                                 |                                                                                                                   No parameters.<br>Returns `Promise<void>`                                                                                                                    | Pauses and resumes processes, used when it is needed to read multiple related values. |
