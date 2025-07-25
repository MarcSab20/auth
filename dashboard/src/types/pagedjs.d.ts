declare module 'pagedjs/dist/paged.polyfill.js' {
  const content: any;
  export = content;
}

declare module 'pagedjs' {
  export interface PagedConfig {
    auto?: boolean;
    before?: () => void;
    after?: () => void;
    settings?: {
      [key: string]: any;
    };
  }

  export class Previewer {
    constructor(config?: PagedConfig);
    preview(content?: string | HTMLElement, stylesheets?: string[], renderTo?: HTMLElement): Promise<any>;
  }

  export class Polyfill {
    constructor(config?: PagedConfig);
  }
} 