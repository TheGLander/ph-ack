// ph! ack!
// aka ph-ack

import { open, FileHandle } from "fs/promises"
import { Library } from "ffi-napi"
import { SIGCONT, SIGSTOP } from "constants"

const { kill } = Library(null, {
	kill: ["int", ["int", "int"]],
})

class PhAck {
	constructor(protected fh: FileHandle, public pid: number) {}
	freeze(): void {
		const ret = kill(this.pid, SIGSTOP)
		if (ret < 0) throw new Error(`SIGSTOP KILL error: ${ret}`)
	}
	unfreeze(): void {
		const ret = kill(this.pid, SIGCONT)
		if (ret < 0) throw new Error(`SIGCONT KILL error: ${ret}`)
	}
	protected async peekGeneric(address: number, len: number): Promise<Buffer> {
		const buff = Buffer.alloc(len)
		await this.fh.read(buff, 0, len, address)
		return buff
	}
	async peekUint8(address: number): Promise<number> {
		return (await this.peekGeneric(address, 1)).readUInt8()
	}
	async peekUint16(address: number, bigEnd?: boolean): Promise<number> {
		return (await this.peekGeneric(address, 2))[
			`readUInt16${bigEnd ? "B" : "L"}E`
		]()
	}
	async peekUint32(address: number, bigEnd?: boolean): Promise<number> {
		return (await this.peekGeneric(address, 4))[
			`readUInt32${bigEnd ? "B" : "L"}E`
		]()
	}
	async peekUint64(address: number, bigEnd?: boolean): Promise<bigint> {
		return (await this.peekGeneric(address, 8))[
			`readBigUInt64${bigEnd ? "B" : "L"}E`
		]()
	}
	async peekInt8(address: number): Promise<number> {
		return (await this.peekGeneric(address, 1)).readInt8()
	}
	async peekInt16(address: number, bigEnd?: boolean): Promise<number> {
		return (await this.peekGeneric(address, 2))[
			`readInt16${bigEnd ? "B" : "L"}E`
		]()
	}
	async peekInt32(address: number, bigEnd?: boolean): Promise<number> {
		return (await this.peekGeneric(address, 4))[
			`readInt32${bigEnd ? "B" : "L"}E`
		]()
	}
	async peekInt64(address: number, bigEnd?: boolean): Promise<bigint> {
		return (await this.peekGeneric(address, 8))[
			`readBigInt64${bigEnd ? "B" : "L"}E`
		]()
	}
	protected async pokeGeneric(address: number, val: Buffer): Promise<void> {
		await this.fh.write(val, 0, val.length, address)
	}
	async pokeUint8(address: number, val: number): Promise<void> {
		const buf = Buffer.alloc(1)
		buf.writeUInt8(val)
		await this.pokeGeneric(address, buf)
	}
	async pokeUint16(
		address: number,
		val: number,
		bigEnd?: boolean
	): Promise<void> {
		const buf = Buffer.alloc(2)
		buf[`writeUInt16${bigEnd ? "B" : "L"}E`](val)
		await this.pokeGeneric(address, buf)
	}
	async pokeUint32(
		address: number,
		val: number,
		bigEnd?: boolean
	): Promise<void> {
		const buf = Buffer.alloc(4)
		buf[`writeUInt32${bigEnd ? "B" : "L"}E`](val)
		await this.pokeGeneric(address, buf)
	}
	async pokeUint64(
		address: number,
		val: bigint,
		bigEnd?: boolean
	): Promise<void> {
		const buf = Buffer.alloc(8)
		buf[`writeBigUInt64${bigEnd ? "B" : "L"}E`](val)
		await this.pokeGeneric(address, buf)
	}
	async pokeInt8(address: number, val: number): Promise<void> {
		const buf = Buffer.alloc(1)
		buf.writeInt8(val)
		await this.pokeGeneric(address, buf)
	}
	async pokeInt16(
		address: number,
		val: number,
		bigEnd?: boolean
	): Promise<void> {
		const buf = Buffer.alloc(2)
		buf[`writeInt16${bigEnd ? "B" : "L"}E`](val)
		await this.pokeGeneric(address, buf)
	}
	async pokeInt32(
		address: number,
		val: number,
		bigEnd?: boolean
	): Promise<void> {
		const buf = Buffer.alloc(4)
		buf[`writeInt32${bigEnd ? "B" : "L"}E`](val)
		await this.pokeGeneric(address, buf)
	}
	async pokeInt64(
		address: number,
		val: bigint,
		bigEnd?: boolean
	): Promise<void> {
		const buf = Buffer.alloc(8)
		buf[`writeBigInt64${bigEnd ? "B" : "L"}E`](val)
		await this.pokeGeneric(address, buf)
	}
}

async function createPhAck(pid: number | "self") {
	const fh = await open(`/proc/${pid}/mem`, "r+")
	return new PhAck(fh, pid === "self" ? process.pid : pid)
}

export { createPhAck, PhAck as InternalPhAck }
