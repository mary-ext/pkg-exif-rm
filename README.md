# exif-rm

Remove EXIF information from PNG and JPEG images.

```ts
const image = await Deno.readFile('./samples/sample.jpg');
const exifRemoved = remove(image.buffer);
```
