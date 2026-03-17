import { describe, expect, test } from "bun:test"
import fs from "fs/promises"
import path from "path"

const root = path.join(__dirname, "..")

async function read(file: string) {
  return fs.readFile(path.join(root, file), "utf-8")
}

describe("web-only TUI decoupling", () => {
  test("loads TUI CLI commands behind a disable flag", async () => {
    const file = await read("src/index.ts")
    expect(file).toContain("Flag.OPENCODE_DISABLE_TUI")
    expect(file).toContain("OPENCODE_TUI_DISABLED")
    expect(file).toContain('import("./cli/cmd/tui/attach")')
    expect(file).toContain('import("./cli/cmd/tui/thread")')
  })

  test("shares TUI events outside the TUI implementation tree", async () => {
    const route = await read("src/server/routes/tui.ts")
    const mcp = await read("src/mcp/index.ts")
    expect(route).toContain('@/bus/events/tui')
    expect(route).not.toContain('@/cli/cmd/tui/event')
    expect(mcp).toContain('@/bus/events/tui')
    expect(mcp).not.toContain('@/cli/cmd/tui/event')
  })

  test("supports no-tui builds without OpenTUI types in shared utils", async () => {
    const build = await read("script/build.ts")
    const keybind = await read("src/util/keybind.ts")
    expect(build).toContain("--no-tui")
    expect(build).toContain("OPENCODE_TUI_DISABLED")
    expect(keybind).not.toContain("@opentui/core")
  })
})
