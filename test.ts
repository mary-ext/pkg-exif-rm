import { assert, assertEquals } from 'jsr:@std/assert';

import { remove } from './mod.ts';

const identify = (() => {
	const decoder = new TextDecoder('utf-8');
	const command = new Deno.Command('identify', {
		args: ['-regard-warnings', '-format', '%[EXIF:*]', '-'],
		stdin: 'piped',
		stdout: 'piped',
		stderr: 'piped',
	});

	return async (image: Uint8Array) => {
		const process = command.spawn();

		{
			const writer = process.stdin.getWriter();
			await writer.write(image);
			await writer.close();
		}

		const { code, stdout, stderr } = await process.output();
		if (code !== 0) {
			throw new Error(`exit code ${code}\n${decoder.decode(stderr)}`);
		}

		const text = decoder.decode(stdout);
		const lines = text.split('\n').filter((line) => line.length > 0);

		const fields = lines.map((line) => {
			const [key, ...rest] = line.split('=');
			const value = rest.join('=');

			return [key, value];
		});

		return Object.fromEntries(fields);
	};
})();

Deno.test('removes EXIF from JPEG files', async () => {
	const image = await Deno.readFile('./samples/sample.jpg');

	// Verify the original image has EXIF data
	assertEquals(await identify(image), {
		'exif:ApertureValue': '368640/65536',
		'exif:ColorSpace': '1',
		'exif:ComponentsConfiguration': '...',
		'exif:CustomRendered': '0',
		'exif:DateTime': '2008:07:31 10:38:11',
		'exif:DateTimeDigitized': '2008:05:30 15:56:01',
		'exif:DateTimeOriginal': '2008:05:30 15:56:01',
		'exif:ExifOffset': '214',
		'exif:ExifVersion': '0221',
		'exif:ExposureBiasValue': '0/1',
		'exif:ExposureMode': '1',
		'exif:ExposureProgram': '1',
		'exif:ExposureTime': '1/160',
		'exif:FNumber': '71/10',
		'exif:Flash': '9',
		'exif:FlashPixVersion': '0100',
		'exif:FocalLength': '135/1',
		'exif:FocalPlaneResolutionUnit': '2',
		'exif:FocalPlaneXResolution': '3888000/876',
		'exif:FocalPlaneYResolution': '2592000/583',
		'exif:GPSInfo': '978',
		'exif:GPSVersionID': '....',
		'exif:InteroperabilityOffset': '948',
		'exif:Make': 'Canon',
		'exif:MeteringMode': '5',
		'exif:Model': 'Canon EOS 40D',
		'exif:Orientation': '1',
		'exif:PhotographicSensitivity': '100',
		'exif:PixelXDimension': '100',
		'exif:PixelYDimension': '68',
		'exif:ResolutionUnit': '2',
		'exif:SceneCaptureType': '0',
		'exif:ShutterSpeedValue': '483328/65536',
		'exif:Software': 'GIMP 2.4.5',
		'exif:SubSecTime': '00',
		'exif:SubSecTimeDigitized': '00',
		'exif:SubSecTimeOriginal': '00',
		'exif:UserComment': '',
		'exif:WhiteBalance': '0',
		'exif:XResolution': '72/1',
		'exif:YCbCrPositioning': '2',
		'exif:YResolution': '72/1',
		'exif:thumbnail:Compression': '6',
		'exif:thumbnail:InteroperabilityIndex': 'R98',
		'exif:thumbnail:InteroperabilityVersion': '0100',
		'exif:thumbnail:JPEGInterchangeFormat': '1090',
		'exif:thumbnail:JPEGInterchangeFormatLength': '1378',
		'exif:thumbnail:ResolutionUnit': '2',
		'exif:thumbnail:XResolution': '72/1',
		'exif:thumbnail:YResolution': '72/1',
	});

	const exifRemoved = remove(image);

	// Verify the image has no EXIF data
	assert(exifRemoved !== null);
	assertEquals(await identify(exifRemoved), {});
});

Deno.test('removes EXIF from PNG files', async () => {
	const image = await Deno.readFile('./samples/sample.png');

	// Verify the original image has EXIF data
	assertEquals(await identify(image), {
		'exif:ApertureValue': '45/8',
		'exif:ColorSpace': '1',
		'exif:ComponentsConfiguration': '...',
		'exif:CustomRendered': '0',
		'exif:DateTime': '2008:07:31 10:38:11',
		'exif:DateTimeDigitized': '2008:05:30 15:56:01',
		'exif:DateTimeOriginal': '2008:05:30 15:56:01',
		'exif:ExifOffset': '190',
		'exif:ExifVersion': '0221',
		'exif:ExposureBiasValue': '0/1',
		'exif:ExposureMode': '1',
		'exif:ExposureProgram': '1',
		'exif:ExposureTime': '1/160',
		'exif:FNumber': '71/10',
		'exif:Flash': '9',
		'exif:FlashPixVersion': '0100',
		'exif:FocalLength': '135/1',
		'exif:FocalPlaneResolutionUnit': '2',
		'exif:FocalPlaneXResolution': '324000/73',
		'exif:FocalPlaneYResolution': '2592000/583',
		'exif:Make': 'Canon',
		'exif:MeteringMode': '5',
		'exif:Model': 'Canon EOS 40D',
		'exif:Orientation': '1',
		'exif:PhotographicSensitivity': '100',
		'exif:PixelXDimension': '100',
		'exif:PixelYDimension': '68',
		'exif:ResolutionUnit': '2',
		'exif:SceneCaptureType': '0',
		'exif:ShutterSpeedValue': '59/8',
		'exif:Software': 'GIMP 2.4.5',
		'exif:SubSecTime': '00',
		'exif:SubSecTimeDigitized': '00',
		'exif:SubSecTimeOriginal': '00',
		'exif:WhiteBalance': '0',
		'exif:XResolution': '72/1',
		'exif:YResolution': '72/1',
	});

	const exifRemoved = remove(image);

	// Verify the image has no EXIF data
	assert(exifRemoved !== null);
	assertEquals(await identify(exifRemoved), {});
});

Deno.test('removes EXIF from WebP files', async () => {
	const image = await Deno.readFile('./samples/sample.webp');

	// Verify the original image has EXIF data
	assertEquals(await identify(image), {
		'exif:ApertureValue': '45/8',
		'exif:ColorSpace': '1',
		'exif:ComponentsConfiguration': '...',
		'exif:CustomRendered': '0',
		'exif:DateTime': '2008:07:31 10:38:11',
		'exif:DateTimeDigitized': '2008:05:30 15:56:01',
		'exif:DateTimeOriginal': '2008:05:30 15:56:01',
		'exif:ExifOffset': '190',
		'exif:ExifVersion': '0221',
		'exif:ExposureBiasValue': '0/1',
		'exif:ExposureMode': '1',
		'exif:ExposureProgram': '1',
		'exif:ExposureTime': '1/160',
		'exif:FNumber': '71/10',
		'exif:Flash': '9',
		'exif:FlashPixVersion': '0100',
		'exif:FocalLength': '135/1',
		'exif:FocalPlaneResolutionUnit': '2',
		'exif:FocalPlaneXResolution': '324000/73',
		'exif:FocalPlaneYResolution': '2592000/583',
		'exif:Make': 'Canon',
		'exif:MeteringMode': '5',
		'exif:Model': 'Canon EOS 40D',
		'exif:Orientation': '1',
		'exif:PhotographicSensitivity': '100',
		'exif:PixelXDimension': '100',
		'exif:PixelYDimension': '68',
		'exif:ResolutionUnit': '2',
		'exif:SceneCaptureType': '0',
		'exif:ShutterSpeedValue': '59/8',
		'exif:Software': 'GIMP 2.4.5',
		'exif:SubSecTime': '00',
		'exif:SubSecTimeDigitized': '00',
		'exif:SubSecTimeOriginal': '00',
		'exif:WhiteBalance': '0',
		'exif:XResolution': '72/1',
		'exif:YResolution': '72/1',
	});

	const exifRemoved = remove(image);

	// Verify the image has no EXIF data
	assert(exifRemoved !== null);
	assertEquals(await identify(exifRemoved), {});
});
