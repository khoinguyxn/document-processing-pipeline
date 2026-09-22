import { AppHeader } from "@/components/app-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { describe, expect, it } from "vitest"
import { render } from "vitest-browser-react"

// `AppHeader` renders `SidebarTrigger`, which reads the `SidebarProvider`
// context, so it has to be mounted inside one.
function renderHeader(props: React.ComponentProps<typeof AppHeader> = {}) {
  return render(
    <SidebarProvider>
      <AppHeader {...props} />
    </SidebarProvider>
  )
}

describe("AppHeader", () => {
  it("AppHeader_ShouldRenderOnlyTheSidebarTrigger_WhenNoHeaderIsDeclared", async () => {
    // Arrange & Act
    const screen = await renderHeader()

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Toggle Sidebar" }))
      .toBeVisible()
    expect(screen.container.querySelector("h1")).toBeNull()
    expect(screen.container.querySelector("input")).toBeNull()
  })

  it("AppHeader_ShouldRenderTheTitleWithoutSearchOrActions_WhenOnlyTheTitleIsDeclared", async () => {
    // Arrange & Act
    const screen = await renderHeader({ title: "Nhà cung cấp" })

    // Assert
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveTextContent("Nhà cung cấp")
    expect(screen.container.querySelector("input")).toBeNull()
  })
})
