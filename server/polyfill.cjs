// Node.js 18에서 undici가 참조하는 File 전역 폴리필
if (!global.File) {
  global.File = class File {
    constructor(chunks, name, opts = {}) {
      this._chunks = chunks;
      this.name = name;
      this.lastModified = opts.lastModified ?? Date.now();
      this.type = opts.type ?? '';
      this.size = chunks.reduce((s, c) => s + (c?.length ?? c?.byteLength ?? 0), 0);
    }
  };
}
