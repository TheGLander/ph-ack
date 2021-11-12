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
	protected async peekGeneric(address: number, n: number): Promise<Buffer> {
		const buff = Buffer.alloc(n)
		await this.fh.read(buff, 0, n, address)
		return buff
	}
	async peekUint8(address: number): Promise<number> {
		return new Uint8Array(await this.peekGeneric(address, 1))[0]
	}
	async peekUint32(address: number): Promise<number> {
		return new Uint32Array(await this.peekGeneric(address, 4))[0]
	}
	protected async pokeGeneric(address: number, val: Buffer): Promise<void> {
		await this.fh.write(val, 0, val.length, address)
	}
	async pokeUint8(address: number, val: number): Promise<void> {
		await this.pokeGeneric(address, Buffer.from([val]))
	}
}

async function createPhAck(pid: number | "self") {
	const fh = await open(`/proc/${pid}/mem`, "r+")
	return new PhAck(fh, pid === "self" ? process.pid : pid)
}

export { createPhAck, PhAck as InternalPhAck }
