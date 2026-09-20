import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Page } from "@/models/pages"
import { Folder, Sheet } from "lucide-react"
import { describe, expect, it } from "vitest"
import { renderWithRouter } from "../utils/router"

const TEST_PAGES: Page[] = [
  { title: "Hòm thư", to: "/app", icon: <Folder /> },
  { title: "Xuất dữ liệu", to: "/app/exports", icon: <Sheet /> },
]

// `AppSidebar` renders `Link`s and `SidebarMenuButton`s, both of which need the
// sidebar and tooltip contexts that `AppLayout` supplies in the real app.
function renderSidebar(pages: Page[] = TEST_PAGES, initialLocation = "/app") {
  return renderWithRouter(
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar pages={pages} />
      </SidebarProvider>
    </TooltipProvider>,
    initialLocation
  )
}

describe("AppSidebar", () => {
  it("AppSidebar_ShouldRenderTheBrandHeader", async () => {
    // Arrange & Act
    const screen = await renderSidebar()

    // Assert
    await expect
      .element(screen.getByRole("heading", { name: "Bắc Nam", level: 3 }))
      .toBeVisible()
    await expect.element(screen.getByText("BN")).toBeVisible()
  })

  it("AppSidebar_ShouldRenderOneMenuItemPerPage", async () => {
    // Arrange & Act
    const screen = await renderSidebar()

    // Assert
    await expect
      .element(screen.getByRole("link", { name: "Hòm thư" }))
      .toBeVisible()
    await expect
      .element(screen.getByRole("link", { name: "Xuất dữ liệu" }))
      .toBeVisible()
  })

  it("AppSidebar_ShouldRenderNoMenuItems_WhenPagesIsEmpty", async () => {
    // Arrange & Act
    const screen = await renderSidebar([])

    // Assert
    await expect
      .element(screen.getByRole("heading", { name: "Bắc Nam", level: 3 }))
      .toBeVisible()
    expect(screen.getByRole("link").elements()).toHaveLength(0)
  })

  it("AppSidebar_ShouldLinkEachMenuItemToItsRoute", async () => {
    // Arrange & Act
    const screen = await renderSidebar()

    // Assert
    const links = screen.getByRole("link").elements()
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/app",
      "/app/exports",
    ])
  })

  it("AppSidebar_ShouldRenderTheIconOfEachPage", async () => {
    // Arrange & Act
    const screen = await renderSidebar()

    // Assert
    const links = screen.getByRole("link").elements()
    expect(links[0].querySelector("svg")).not.toBeNull()
    expect(links[1].querySelector("svg")).not.toBeNull()
  })

  it("AppSidebar_ShouldRenderTheRail", async () => {
    // Arrange & Act
    const screen = await renderSidebar()

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Toggle Sidebar" }))
      .toBeVisible()
  })

  it("AppSidebar_ShouldForwardDomProps_WhenExtraAttributesArePassed", async () => {
    // Arrange & Act
    const screen = await renderWithRouter(
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar pages={TEST_PAGES} id="test-sidebar" />
        </SidebarProvider>
      </TooltipProvider>,
      "/app"
    )

    // Assert
    const container = screen.container.querySelector(
      '[data-slot="sidebar-container"]'
    )
    expect(container).not.toBeNull()
    expect(container?.getAttribute("id")).toBe("test-sidebar")
  })
})
