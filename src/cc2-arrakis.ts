import { createPhAck } from "./index"
import { createInterface, Interface } from "readline"

const rl = createInterface(process.stdin, process.stdout)

declare module "readline" {
	interface Interface {
		questionAsync(prompt?: string): Promise<string>
	}
}

Interface.prototype.questionAsync = function (this: Interface, query: string) {
	return new Promise(res => this.question(query, res))
}

const CHIP_COUNT = 0x5e8e8c,
	TIME_LEFT = 0x5e8e88,
	LEVEL_N = 0x5e8e8c,
	ACTIVE_PLAYABLE_DIRECTION = 0x5ea37b,
	ACTIVE_PLAYABLE_COOLDOWN = 0x5ea37a,
	ACTOR_0_DIRECTION = 0x86a493,
	ACTOR_0_COOLDOWN = 0x86a492,
	ACTOR_1_DIRECTION = 0x86b453,
	ACTOR_1_COOLDOWN = 0x86a492,
	ACTOR_STRUCT_LEN = 0x60

;(async () => {
	const pid = parseInt(await rl.questionAsync("CC2 pid?"))
	if (isNaN(pid)) {
		console.log("Maybe enter a number?")
		process.exit(1)
	}
	const pa = await createPhAck(pid)
	async function peekAssert(
		address: number,
		val: number,
		assertName: string,
		thirtyTwo?: boolean
	): Promise<void> {
		const gottenVal = await pa[thirtyTwo ? "peekUint32" : "peekUint8"](address)
		if (gottenVal !== val) {
			console.error(
				`Assertion ${assertName} failed! Are you sure you are on Settlements Of Arrakis?
				(Got ${gottenVal} expected ${val})`
			)
			process.exit(1)
		}
	}
	await peekAssert(CHIP_COUNT, 2, "Chips")
	await peekAssert(TIME_LEFT, 350 * 60, "Time", true)
	await peekAssert(LEVEL_N, 45, "Level n")
	console.log("This is Settlements of Arrakis, ya'll!")
})()
