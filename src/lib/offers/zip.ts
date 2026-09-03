// Minimal STORE-method zip writer (self-contained, no libraries).
// Ported verbatim from S3 665–678.

const _CRC: number[] = (() => {
  let c: number
  const t: number[] = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(u8: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < u8.length; i++) c = _CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function _cat(arrs: Uint8Array[]): Uint8Array {
  let len = 0
  arrs.forEach((a) => (len += a.length))
  const out = new Uint8Array(len)
  let o = 0
  arrs.forEach((a) => {
    out.set(a, o)
    o += a.length
  })
  return out
}

function _u16(n: number): Uint8Array {
  return new Uint8Array([n & 255, (n >> 8) & 255])
}

function _u32(n: number): Uint8Array {
  return new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255])
}

export interface ZipFile {
  name: string
  bytes: Uint8Array
}

export function makeZip(files: ZipFile[]): Uint8Array {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  files.forEach(function (f) {
    const nm = enc.encode(f.name)
    const data = f.bytes
    const crc = crc32(data)
    const lh = _cat([
      _u32(0x04034b50),
      _u16(20),
      _u16(0),
      _u16(0),
      _u16(0),
      _u16(0),
      _u32(crc),
      _u32(data.length),
      _u32(data.length),
      _u16(nm.length),
      _u16(0),
      nm,
    ])
    parts.push(lh, data)
    const cd = _cat([
      _u32(0x02014b50),
      _u16(20),
      _u16(20),
      _u16(0),
      _u16(0),
      _u16(0),
      _u16(0),
      _u32(crc),
      _u32(data.length),
      _u32(data.length),
      _u16(nm.length),
      _u16(0),
      _u16(0),
      _u16(0),
      _u16(0),
      _u32(0),
      _u32(offset),
      nm,
    ])
    central.push(cd)
    offset += lh.length + data.length
  })
  const cbytes = _cat(central)
  const eocd = _cat([
    _u32(0x06054b50),
    _u16(0),
    _u16(0),
    _u16(files.length),
    _u16(files.length),
    _u32(cbytes.length),
    _u32(offset),
    _u16(0),
  ])
  return _cat(parts.concat([cbytes, eocd]))
}
