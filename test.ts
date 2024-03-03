import { assert } from 'jsr:@std/assert';

import { remove } from './mod.ts';

Deno.test('removes EXIF from JPEG files', async () => {
	const image = await Deno.readFile('./samples/sample.jpg');
	const exifRemoved = remove(image.buffer);

	assert(exifRemoved != null);
	assert(exifRemoved.byteLength === 5480);
});

Deno.test('removes EXIF from PNG files', async () => {
	const image = await Deno.readFile('./samples/sample.png');
	const exifRemoved = remove(image.buffer);

	assert(exifRemoved != null);
	assert(exifRemoved.byteLength === 17638);
});
