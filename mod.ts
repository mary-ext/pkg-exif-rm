/**
 * Removes EXIF information from PNG and JPEG images
 * @returns A new image buffer with EXIF removed, will return `null` if
 *   image is unsupported, or if there's nothing to remove.
 */
export const remove = (buf: Uint8Array): Uint8Array | null => {
	const blen = buf.byteLength;

	const view = new DataView(buf.buffer, buf.byteOffset, blen);
	const indices: [start: number, end: number][] = [];

	let start = 0;
	let webp = false;

	if (blen >= 2 && view.getUint16(0) === 0xffd8) {
		// JPEG
		let pos = 2;

		while (pos + 4 + 5 <= blen) {
			const marker = view.getUint16(pos);

			if (/* Fill */ marker === 0xffff) {
				pos++;

				continue;
			} else if (
				/* App0..App15 */ (marker >= 0xffe0 && marker <= 0xffef) ||
					/* Comment */ marker === 0xfffe ||
					/* SOF0 */ marker === 0xffc0 ||
					/* SOF2 */ marker === 0xffc2 ||
					/* DHT */ marker === 0xffc4 ||
					/* DQT */ marker === 0xffdb ||
					/* DRI */ marker === 0xffdd ||
					/* SOS */ marker === 0xffda
			) {
				const flen = view.getUint16(pos + 2);
				const end = pos + 2 + flen;

				if (
					/* App1 */ marker === 0xffe1 &&
						/* Exif */ view.getUint32(pos + 4) === 0x45786966 &&
						/* null */ view.getUint16(pos + 8) === 0x0
				) {
					indices.push([start, pos]);
					start = end;
				}

				pos = end;
				continue;
			}

			break;
		}
	} else if (blen >= 8 && view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
		// PNG
		let pos = 8;

		while (pos + 4 + 4 <= blen) {
			const flen = view.getUint32(pos);
			const marker = view.getUint32(pos + 4);

			const end = pos + flen + 4 + 4 + 4;

			if (
				/* eXIf */ marker === 0x65584966 ||
					/* tIME */ marker === 0x74494d45 ||
					/* iTXt */ marker === 0x69545874 ||
					/* tEXt */ marker === 0x74455874 ||
					/* zTXT */ marker === 0x7a545874 ||
					/* dSIG */ marker === 0x64534947
			) {
				indices.push([start, pos]);
				start = end;
			}

			pos = end;
		}
	} else if (
		blen >= 12 &&
		/* RIFF */ view.getUint32(0) === 0x52494646 &&
		/* WEBP */ view.getUint32(8) === 0x57454250
	) {
		// WebP
		let pos = 12;

		webp = true;

		// RIFF format uses little-endian
		while (pos + 4 + 4 <= blen) {
			const marker = view.getUint32(pos, true);

			const chunkSize = view.getUint32(pos + 4, true);
			const end = pos + chunkSize + 4 + 4;

			if (/* EXIF */ marker === 0x46495845 || /* "XMP "" */ marker === 0x20504D58) {
				indices.push([start, pos]);
				start = end;
			}

			// Move to the next chunk, add padding byte if chunk size is odd
			pos = end;
			if (chunkSize & 1) {
				pos++;
			}
		}
	}

	if (start === 0) {
		return null;
	}

	const copy = new Uint8Array(indices.reduce((accu, index) => accu + (index[1] - index[0]), blen - start));

	copy.set(
		buf.subarray(start),
		indices.reduce((offset, index) => {
			copy.set(buf.subarray(index[0], index[1]), offset);
			return offset + (index[1] - index[0]);
		}, 0),
	);

	if (webp) {
		// Alter the RIFF header to reflect the new size
		const view = new DataView(copy.buffer);
		const newSize = copy.byteLength - 8;

		view.setUint32(4, newSize, true);
	}

	return copy;
};
