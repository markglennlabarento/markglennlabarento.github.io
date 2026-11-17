export class ThemeService {
  #root
  #iconLink

  constructor(
    root = document.documentElement,
    iconLink = document.querySelector('link[rel="icon"]'),
  ) {
    this.#root = root
    this.#iconLink = iconLink
  }

  apply(theme) {
    this.#root.dataset.theme = theme
    this.#iconLink?.setAttribute('href', this.getIconPath(theme))
  }

  getIconPath(theme) {
    return `/mark-favicon${theme === 'light' ? '-light' : ''}.svg?v=5`
  }
}
