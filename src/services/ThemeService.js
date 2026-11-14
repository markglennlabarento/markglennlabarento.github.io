export class ThemeService {
  #root
  #favicon

  constructor(
    root = document.documentElement,
    favicon = document.querySelector('link[rel="icon"]'),
  ) {
    this.#root = root
    this.#favicon = favicon
  }

  apply(theme) {
    this.#root.dataset.theme = theme
    this.#favicon?.setAttribute('href', this.getIconPath(theme))
  }

  getIconPath(theme) {
    return `/mark-favicon${theme === 'light' ? '-light' : ''}.svg?v=5`
  }
}
