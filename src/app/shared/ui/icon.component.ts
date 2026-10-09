import { Component, Input, computed } from '@angular/core';

const PATHS: Record<string, string> = {
  dashboard: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4a7 7 0 105.2 11.6L21 20.4 20.4 21l-4.8-4.8A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zm1 4H11v6l5 3 1-1.6-4-2.4V7z',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  alert: 'M12 3l10 18H2L12 3zm0 6v5m0 3v.5',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0v1H5v-1z',
  back: 'M15 5l-7 7 7 7',
  swap: 'M7 4L3 8l4 4M3 8h13M17 12l4 4-4 4M21 16H8',
  pin: 'M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  file: 'M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm8 1v6h6M9 13h7M9 17h7',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-7 9a7 7 0 0114 0M17 8a3 3 0 110 6M21 20a6 6 0 00-4-5.6',
  sheet: 'M6 2h12a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm0 5h13M9 8v13M15 13h2M9 13h4M9 17h6',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-2-1.2L14.5 3h-5l-.4 2.6a7.5 7.5 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 002 1.2l.4 2.6h5l.4-2.6a7.5 7.5 0 002-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  chevron: 'M6 9l6 6 6-6',
  collapse: 'M11 5l-7 7 7 7M18 5l-7 7 7 7',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 110-6 3 3 0 010 6z',
  eyeOff: 'M3 3l18 18M10.6 5.2A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 3.9M6.6 6.6A16.6 16.6 0 002 12s3.5 7 10 7a9.6 9.6 0 004.4-1.1M9.9 9.9a3 3 0 004.2 4.2',
  lock: 'M6 11V8a6 6 0 0112 0v3M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1zm3 0V8a3 3 0 016 0v3',
  mail: 'M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zm1 2l7 5 7-5',
  edit: 'M4 20h4L20 8l-4-4L4 16v4zm4-4l8-8',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  building: 'M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M16 9h3a1 1 0 011 1v11M4 21h17M8 7h4M8 11h4M8 15h4',
};

@Component({
  selector: 'du-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="d()" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class IconComponent {
  @Input() name = 'folder';
  @Input() size = 18;
  d = computed(() => PATHS[this.name] ?? PATHS['folder']);
}
