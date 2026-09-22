; (function () {
    const DESKTOP_WIDTH = 1080

    function isDesktop() {
        return window.innerWidth >= DESKTOP_WIDTH
    }

    function formatBytes(bytes) {
        if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0) return "-"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB"
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB"
    }

    function downloadLink(name, link) {
        return link
            ? `<a href="${link}" target="_blank" rel="noopener">${name}</a>`
            : name
    }

    function renderTable(data) {
        const rows = data.map((item, i) =>
            `<tr>
                <td class="d-none">${i + 1}</td>
                <td>${item.version}</td>
                <td>${formatBytes(item.size)}</td>
                <td>${downloadLink(item.name, item.src)}</td>
            </tr>`
        ).join("")

        return `<table class="text-center">
            <thead>
                <tr>
                    <th class="d-none">#</th>
                    <th>版本名</th>
                    <th>包体大小</th>
                    <th>官方直链</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`
    }

    function renderButton(data) {
        return data.map((item) =>
            `<mdui-button variant="elevated" href="${item.link}" target="_blank">${item.name}</mdui-button>`
        ).join("")
    }

    function renderReferences(data) {
        return data.map((item) =>
            `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`
        ).join("")
    }

    function initAppTheme() {
        const themeModeItem = document.querySelectorAll("#top-bar .theme .item")
        const themeModeIcon = document.querySelector("#top-bar .mode")
        const themeMode = document.querySelector("#top-bar .theme")
        let nowTheme = localStorage.getItem("theme") || "auto"

        if (nowTheme == "light") {
            themeModeIcon.icon = "light_mode--outlined"
        } else if (nowTheme == "dark") {
            themeModeIcon.icon = "dark_mode--outlined"
        } else {
            themeModeIcon.icon = "contrast--outlined"
        }

        mdui.setTheme(nowTheme)
        themeMode.value = nowTheme
        localStorage.setItem("theme", nowTheme)

        themeModeItem.forEach(item => {
            item.addEventListener("click", (e) => {
                if (item.hasAttribute("selected")) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }
                nowTheme = e.currentTarget.getAttribute("value")
                mdui.setTheme(nowTheme)
                localStorage.setItem("theme", nowTheme)
                if (nowTheme == "light") {
                    themeModeIcon.icon = "light_mode--outlined"
                } else if (nowTheme == "dark") {
                    themeModeIcon.icon = "dark_mode--outlined"
                } else {
                    themeModeIcon.icon = "contrast--outlined"
                }
            })
        })
    }

    function initDrawer() {
        const drawer = document.querySelector("#nav-drawer")
        const menuBtn = document.querySelector("#menu-btn")
        if (!drawer || !menuBtn) return

        function applyMode() {
            const toDesktop = isDesktop()

            const finalize = () => {
                if (isDesktop() !== toDesktop) return
                if (toDesktop) {
                    drawer.modal = false
                    drawer.open = true
                } else {
                    drawer.modal = true
                    drawer.open = false
                }
            }

            if (drawer.open) {
                drawer.addEventListener("closed", finalize, { once: true })
                setTimeout(finalize, 600)
                drawer.open = false
            } else {
                finalize()
            }
        }

        applyMode()

        menuBtn.addEventListener("click", () => {
            drawer.open = !drawer.open
        })

        drawer.querySelectorAll("mdui-list-item[href]").forEach((item) => {
            item.addEventListener("click", () => {
                if (!isDesktop()) drawer.open = false
            })
        })

        let lastDesktop = isDesktop()
        window.addEventListener("resize", () => {
            const desktop = isDesktop()
            if (desktop !== lastDesktop) {
                lastDesktop = desktop
                applyMode()
            }
        })
    }

    function initBackToTop() {
        const btn = document.querySelector("#back-to-top")
        if (!btn) return

        window.addEventListener("scroll", () => {
            btn.classList.toggle("visible", window.scrollY >= 520)
        }, { passive: true })

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" })
        })
    }

    function initContent() {
        const sections = {
            continuity,
            manager,
            milink2,
            milink1,
            miremote,
            mistore,
        }

        for (const [id, data] of Object.entries(sections)) {
            const container = document.querySelector(`#${id} .table-container`)
            if (container && Array.isArray(data)) container.innerHTML = renderTable(data)
        }

        const downloadContainer = document.querySelector("#download .table-container")
        if (downloadContainer && Array.isArray(download)) downloadContainer.innerHTML = renderButton(download)

        const referencesContainer = document.querySelector(".references")
        if (referencesContainer && Array.isArray(references)) referencesContainer.innerHTML = renderReferences(references)

    }

    document.addEventListener("DOMContentLoaded", () => {
        initDrawer()
        initBackToTop()
        initContent()
        initAppTheme()
    })
})()
